"""Resolving a session cookie to a Focusmate access token.

The distinction this module has to keep is between "this session is not valid"
and "we could not find out". The first signs the user out; the second must not,
or a brief Supabase outage logs out everyone at once.
"""

import pytest
from fastapi import Request

from api_utils import request as request_module
from api_utils.encryption import encrypt
from api_utils.request import SessionNotFound, get_access_token, get_session_id

TOKEN = "fm_access_token_abc123"


class FakeQuery:
    """Stands in for the supabase-js style builder chain:
    `table(...).select(...).eq(...).execute()`."""

    def __init__(self, result=None, error=None):
        self._result = result
        self._error = error
        self.calls = []

    def table(self, name):
        self.calls.append(("table", name))
        return self

    def select(self, columns):
        self.calls.append(("select", columns))
        return self

    def eq(self, column, value):
        self.calls.append(("eq", column, value))
        return self

    def execute(self):
        if self._error is not None:
            raise self._error
        return self._result


class FakeResponse:
    def __init__(self, data):
        self.data = data


@pytest.fixture
def fake_supabase(monkeypatch):
    def install(result=None, error=None):
        client = FakeQuery(result=result, error=error)
        monkeypatch.setattr(request_module, "supabase_client", client)
        return client
    return install


def build_request(cookies):
    scope = {
        "type": "http",
        "headers": [(b"cookie",
                     "; ".join(f"{k}={v}" for k, v in cookies.items())
                     .encode())] if cookies else [],
    }
    return Request(scope)


class TestGetSessionId:
    def test_reads_the_session_cookie(self):
        assert get_session_id(build_request({"sessionId": "abc"})) == "abc"

    def test_returns_none_without_the_cookie(self):
        # The routes turn this into a 400 rather than treating it as a session
        assert get_session_id(build_request({})) is None

    def test_ignores_unrelated_cookies(self):
        request = build_request({"oauthState": "xyz"})
        assert get_session_id(request) is None


class TestGetAccessToken:
    def test_returns_the_decrypted_token(self, fake_supabase):
        fake_supabase(FakeResponse([
            {"access_token_encrypted": encrypt(TOKEN)}]))
        assert get_access_token("session-1") == TOKEN

    def test_queries_the_profile_row_for_that_session(self, fake_supabase):
        client = fake_supabase(FakeResponse([
            {"access_token_encrypted": encrypt(TOKEN)}]))
        get_access_token("session-1")
        assert ("table", "profile") in client.calls
        assert ("eq", "session_id", "session-1") in client.calls

    def test_no_matching_row_is_an_invalid_session(self, fake_supabase):
        # What a signed-out or never-valid session looks like
        fake_supabase(FakeResponse([]))
        with pytest.raises(SessionNotFound):
            get_access_token("session-1")

    def test_a_row_missing_the_column_is_an_invalid_session(
            self, fake_supabase):
        fake_supabase(FakeResponse([{"user_id": "u1"}]))
        with pytest.raises(SessionNotFound):
            get_access_token("session-1")

    def test_null_data_is_an_invalid_session(self, fake_supabase):
        fake_supabase(FakeResponse(None))
        with pytest.raises(SessionNotFound):
            get_access_token("session-1")

    def test_an_undecryptable_token_is_an_invalid_session(self, fake_supabase):
        # Ciphertext written under a rotated key is dead for this session, but
        # signing in again re-encrypts under the current one -- so send the
        # user back to sign-in rather than raising a 500
        fake_supabase(FakeResponse([
            {"access_token_encrypted": "not-valid-ciphertext"}]))
        with pytest.raises(SessionNotFound):
            get_access_token("session-1")

    def test_a_supabase_failure_is_not_an_invalid_session(self, fake_supabase):
        # This is the important one. Swallowing the outage into
        # SessionNotFound would sign every active user out while Supabase is
        # briefly unreachable, instead of failing loudly as a 5xx.
        fake_supabase(error=ConnectionError("supabase unreachable"))
        with pytest.raises(ConnectionError):
            get_access_token("session-1")

    def test_session_not_found_carries_a_reason(self, fake_supabase):
        fake_supabase(FakeResponse([]))
        with pytest.raises(SessionNotFound, match="No profile row"):
            get_access_token("session-1")
