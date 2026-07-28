"""The Focusmate client and the cache in front of it.

Three behaviours here are load-bearing and easy to regress:

- A token Focusmate has stopped honoring is an invalid session, not a 500.
- A year of sessions that fails to fetch must raise rather than default to [],
  which would rewrite that year as "no sessions" and cache the result.
- The session is re-checked against the database ahead of the cache, so
  signing out takes effect immediately rather than at the next TTL lapse.
"""

import http.client
import json

import pytest
from cachetools import TTLCache
from cachetools.keys import hashkey

from api_utils import focusmate as focusmate_module
from api_utils.focusmate import (
    fetch_focusmate_profile,
    fetch_focusmate_sessions_by_year,
    get_data,
)
from api_utils.request import SessionNotFound
from tests.conftest import raw_session

TOKEN = "fm_access_token_abc123"
PROFILE = {
    "user": {
        "userId": "user-1",
        "name": "Ada",
        "totalSessionCount": 12,
        "timeZone": "America/New_York",
        "photoUrl": "https://example.test/ada.png",
        "memberSince": "2026-01-01T00:00:00Z",
    }
}


class FakeHTTPResponse:
    def __init__(self, status, body):
        self.status = status
        self._body = body.encode()

    def read(self):
        return self._body


class FakeHTTPSConnection:
    """Captures what the profile fetch sends and replays a canned response."""

    instances = []

    def __init__(self, host, context=None, timeout=None):
        self.host = host
        self.context = context
        self.timeout = timeout
        self.requests = []
        self.closed = False
        FakeHTTPSConnection.instances.append(self)

    def request(self, method, endpoint, headers=None):
        self.requests.append((method, endpoint, headers or {}))

    def getresponse(self):
        return self.response

    def close(self):
        self.closed = True


@pytest.fixture
def fake_profile_connection(monkeypatch):
    FakeHTTPSConnection.instances = []

    def install(status=200, body=None):
        def factory(host, context=None, timeout=None):
            connection = FakeHTTPSConnection(host, context, timeout)
            connection.response = FakeHTTPResponse(
                status, json.dumps(PROFILE if body is None else body))
            return connection

        monkeypatch.setattr(http.client, "HTTPSConnection", factory)
        return FakeHTTPSConnection.instances

    return install


class TestFetchProfile:
    def test_returns_the_parsed_body(self, fake_profile_connection):
        fake_profile_connection()
        assert fetch_focusmate_profile(TOKEN) == PROFILE

    def test_sends_the_bearer_token(self, fake_profile_connection):
        instances = fake_profile_connection()
        fetch_focusmate_profile(TOKEN)
        _, _, headers = instances[0].requests[0]
        assert headers["Authorization"] == f"Bearer {TOKEN}"

    def test_sets_a_timeout(self, fake_profile_connection):
        # http.client defaults to no timeout at all, so a hung connection
        # would hold the serverless function until the platform killed it
        instances = fake_profile_connection()
        fetch_focusmate_profile(TOKEN)
        assert instances[0].timeout == focusmate_module.FM_REQUEST_TIMEOUT_S

    def test_passes_an_explicit_ssl_context(self, fake_profile_connection):
        # Without it the request falls back to the process-wide default, and
        # this one carries a bearer token
        instances = fake_profile_connection()
        fetch_focusmate_profile(TOKEN)
        assert instances[0].context is focusmate_module.ssl_context

    @pytest.mark.parametrize("status", [401, 403])
    def test_a_rejected_token_is_an_invalid_session(
            self, fake_profile_connection, status):
        # Typically the user revoked our access on Focusmate's side. Our own
        # session row is intact, so without this they keep passing the sign-in
        # check while every dashboard call 500s behind a loading skeleton.
        fake_profile_connection(status=status, body={})
        with pytest.raises(SessionNotFound):
            fetch_focusmate_profile(TOKEN)

    @pytest.mark.parametrize("status", [400, 429, 500, 503])
    def test_other_failures_raise_a_runtime_error(
            self, fake_profile_connection, status):
        # Not a session problem, so it must not sign the user out
        fake_profile_connection(status=status, body={})
        with pytest.raises(RuntimeError):
            fetch_focusmate_profile(TOKEN)

    def test_closes_the_connection_even_when_it_fails(
            self, fake_profile_connection):
        instances = fake_profile_connection(status=500, body={})
        with pytest.raises(RuntimeError):
            fetch_focusmate_profile(TOKEN)
        assert instances[0].closed is True


class FakeAiohttpResponse:
    def __init__(self, status, payload):
        self.status = status
        self._payload = payload

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    def raise_for_status(self):
        if self.status >= 400:
            raise RuntimeError(f"HTTP {self.status}")

    async def json(self):
        return self._payload


class FakeAiohttpSession:
    def __init__(self, response):
        self._response = response
        self.urls = []

    def get(self, url, headers=None):
        self.urls.append(url)
        return self._response


class TestFetchSessionsByYear:
    async def test_returns_the_sessions_list(self):
        session = FakeAiohttpSession(
            FakeAiohttpResponse(200, {"sessions": [raw_session()]}))
        result = await fetch_focusmate_sessions_by_year(
            session, "https://api.focusmate.test/v1/sessions?start=x", {})
        assert len(result) == 1

    async def test_an_empty_year_is_fine(self):
        session = FakeAiohttpSession(
            FakeAiohttpResponse(200, {"sessions": []}))
        result = await fetch_focusmate_sessions_by_year(session, "url", {})
        assert result == []

    async def test_a_failed_year_raises(self):
        # Defaulting to [] would silently rewrite that year as "no sessions".
        # The dashboard would then show confidently wrong totals and cache
        # them, rather than surfacing the failed dependency.
        session = FakeAiohttpSession(FakeAiohttpResponse(500, {}))
        with pytest.raises(RuntimeError):
            await fetch_focusmate_sessions_by_year(session, "url", {})

    async def test_a_response_without_the_sessions_key_raises(self):
        session = FakeAiohttpSession(
            FakeAiohttpResponse(200, {"unexpected": "shape"}))
        with pytest.raises(RuntimeError, match="no 'sessions' key"):
            await fetch_focusmate_sessions_by_year(session, "url", {})


class TestGetData:
    """`get_data` is the one entry point every dashboard route goes through."""

    @pytest.fixture
    def cache(self):
        return TTLCache(maxsize=10, ttl=60)

    @pytest.fixture
    def stub_pipeline(self, monkeypatch):
        """Replace the two network calls and the token lookup, and count them
        so cache behaviour is observable."""
        calls = {"token": 0, "profile": 0, "sessions": 0}

        def install(token_error=None, profile_error=None, profile=PROFILE,
                    sessions=None):
            def get_access_token(session_id):
                calls["token"] += 1
                if token_error is not None:
                    raise token_error
                return TOKEN

            def fetch_profile(access_token):
                calls["profile"] += 1
                if profile_error is not None:
                    raise profile_error
                return profile

            async def fetch_sessions(access_token, member_since):
                calls["sessions"] += 1
                return sessions if sessions is not None else [raw_session()]

            monkeypatch.setattr(
                focusmate_module, "get_access_token", get_access_token)
            monkeypatch.setattr(
                focusmate_module, "fetch_focusmate_profile", fetch_profile)
            monkeypatch.setattr(
                focusmate_module, "fetch_focusmate_sessions", fetch_sessions)
            return calls

        return install

    async def test_returns_the_profile_and_a_session_frame(
            self, cache, stub_pipeline):
        stub_pipeline()
        profile, sessions = await get_data("session-1", cache)
        assert profile["userId"] == "user-1"
        assert len(sessions) == 1

    async def test_an_unknown_session_yields_nothing(self, cache,
                                                     stub_pipeline):
        stub_pipeline(token_error=SessionNotFound("gone"))
        assert await get_data("session-1", cache) == (None, None)

    async def test_a_token_focusmate_rejects_yields_nothing(
            self, cache, stub_pipeline):
        stub_pipeline(profile_error=SessionNotFound("revoked"))
        assert await get_data("session-1", cache) == (None, None)

    async def test_a_supabase_outage_propagates(self, cache, stub_pipeline):
        # Must not read as "your session is invalid", which would sign every
        # active user out during a brief outage
        stub_pipeline(token_error=ConnectionError("supabase unreachable"))
        with pytest.raises(ConnectionError):
            await get_data("session-1", cache)

    async def test_a_second_call_is_served_from_the_cache(
            self, cache, stub_pipeline):
        calls = stub_pipeline()
        await get_data("session-1", cache)
        await get_data("session-1", cache)
        assert calls["profile"] == 1
        assert calls["sessions"] == 1

    async def test_the_session_is_rechecked_ahead_of_the_cache(
            self, cache, stub_pipeline):
        # Serving the cache first would keep a session that /api/sign-out just
        # revoked working until the TTL lapsed
        calls = stub_pipeline()
        await get_data("session-1", cache)
        assert calls["token"] == 1

        await get_data("session-1", cache)
        assert calls["token"] == 2  # checked again, not skipped

    async def test_a_revoked_session_stops_working_immediately(
            self, cache, stub_pipeline, monkeypatch):
        stub_pipeline()
        await get_data("session-1", cache)

        def revoked(session_id):
            raise SessionNotFound("signed out")

        monkeypatch.setattr(focusmate_module, "get_access_token", revoked)

        assert await get_data("session-1", cache) == (None, None)

    async def test_two_sessions_do_not_share_cache_entries(
            self, cache, stub_pipeline):
        calls = stub_pipeline()
        await get_data("session-1", cache)
        await get_data("session-2", cache)
        assert calls["profile"] == 2

    async def test_caches_under_the_expected_keys(self, cache, stub_pipeline):
        stub_pipeline()
        await get_data("session-1", cache)
        assert hashkey("profile", "session-1") in cache
        assert hashkey("sessions", "session-1") in cache

    async def test_a_profile_without_a_user_key_raises(self, cache,
                                                       stub_pipeline):
        stub_pipeline(profile={"unexpected": "shape"})
        with pytest.raises(RuntimeError, match="no 'user' key"):
            await get_data("session-1", cache)

    async def test_an_account_with_no_sessions_still_returns_a_frame(
            self, cache, stub_pipeline):
        stub_pipeline(sessions=[])
        profile, sessions = await get_data("session-1", cache)
        assert profile["userId"] == "user-1"
        assert sessions.empty
