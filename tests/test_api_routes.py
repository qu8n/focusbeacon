"""End-to-end through the ASGI app, with Focusmate and Supabase stubbed out.

`get_session_id` is swapped through `dependency_overrides`; everything past it
-- `get_data`, the goal and streak writers -- is monkeypatched at the
`api.index` import site, which is where the names are actually looked up.
"""

import pandas as pd
import pytest
from fastapi.testclient import TestClient

import api.index as api_index
from api.index import GOAL_LIMITS, app
from api_utils.request import get_session_id
from tests.conftest import make_sessions

PROFILE = {
    "userId": "user-1",
    "name": "Ada",
    "totalSessionCount": 12,
    "timeZone": "UTC",
    "photoUrl": "https://example.test/ada.png",
    "memberSince": "2026-01-01T00:00:00Z",
}

PERIOD_ROUTES = ["/api/py/streak", "/api/py/week", "/api/py/month",
                 "/api/py/year", "/api/py/lifetime"]
ALL_GET_ROUTES = PERIOD_ROUTES + ["/api/py/profile-photo", "/api/py/goal",
                                  "/api/py/history-all"]


def day(date, **kwargs):
    return {"start": f"{date} 10:00", **kwargs}


BUSY_MONTH = [day(f"2027-03-{d:02d}", partner=f"p{d % 3}")
              for d in range(1, 10)]


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def signed_in(monkeypatch):
    """Give the app a resolvable session backed by a session frame."""
    def install(sessions=None, profile=None):
        resolved = PROFILE if profile is None else profile
        frame = (make_sessions(BUSY_MONTH) if sessions is None
                 else make_sessions(sessions))

        async def get_data(session_id, cache):
            return resolved, frame

        app.dependency_overrides[get_session_id] = lambda: "session-1"
        monkeypatch.setattr(api_index, "get_data", get_data)
        return frame

    yield install
    app.dependency_overrides.clear()


@pytest.fixture
def no_session(monkeypatch):
    """A cookie is presented but resolves to nothing -- signed out, deleted
    profile, or a token that no longer decrypts."""
    async def get_data(session_id, cache):
        return None, None

    app.dependency_overrides[get_session_id] = lambda: "stale-session"
    monkeypatch.setattr(api_index, "get_data", get_data)
    yield
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def clear_cache():
    api_index.user_data_cache.clear()
    yield
    api_index.user_data_cache.clear()


@pytest.fixture(autouse=True)
def no_supabase_writes(monkeypatch):
    """Stub the three Supabase-backed helpers for every test in this module.

    Without this a route that reaches one of them tries a real round trip, and
    the test fails with a DNS error somewhere far from the cause. Tests that
    care about the return value override these.
    """
    monkeypatch.setattr(api_index, "update_daily_streak",
                        lambda user_id, streak: False)
    monkeypatch.setattr(api_index, "get_weekly_goal",
                        lambda user_id: {"goal": 0, "goal_type": "sessions"})
    monkeypatch.setattr(
        api_index, "update_weekly_goal",
        lambda user_id, goal, goal_type: {"goal": goal,
                                          "goal_type": goal_type})


class TestAuthentication:
    @pytest.mark.parametrize("route", ALL_GET_ROUTES)
    def test_a_dead_session_gets_401_not_500(self, client, no_session, route):
        # Every route reads off `profile` immediately, so without the guard in
        # load_user_data this is an AttributeError and a 500
        assert client.get(route).status_code == 401

    def test_post_routes_also_reject_a_dead_session(self, client, no_session):
        assert client.post("/api/py/goal", json={"goal": 5}).status_code == 401
        assert client.post(
            "/api/py/history",
            json={"page_index": 0, "page_size": 10}).status_code == 401

    def test_no_cookie_at_all_is_a_400_from_signin_status(self, client):
        app.dependency_overrides[get_session_id] = lambda: None
        assert client.get("/api/py/signin-status").status_code == 400


class TestSigninStatus:
    def test_a_resolvable_session_is_valid(self, client, monkeypatch):
        app.dependency_overrides[get_session_id] = lambda: "session-1"
        monkeypatch.setattr(api_index, "get_access_token",
                            lambda session_id: "token")
        assert client.get("/api/py/signin-status").status_code == 200

    def test_an_unknown_session_is_a_400(self, client, monkeypatch):
        from api_utils.request import SessionNotFound

        def reject(session_id):
            raise SessionNotFound("gone")

        app.dependency_overrides[get_session_id] = lambda: "session-1"
        monkeypatch.setattr(api_index, "get_access_token", reject)
        assert client.get("/api/py/signin-status").status_code == 400

    def test_does_not_fetch_from_focusmate(self, client, monkeypatch):
        # This runs on every page load as the client's route guard. Calling
        # get_data here made it pay for a full profile-and-history sync, and
        # any Focusmate hiccup came back non-2xx and read as "signed out".
        called = []

        async def get_data(session_id, cache):
            called.append(session_id)
            return PROFILE, make_sessions([])

        app.dependency_overrides[get_session_id] = lambda: "session-1"
        monkeypatch.setattr(api_index, "get_access_token",
                            lambda session_id: "token")
        monkeypatch.setattr(api_index, "get_data", get_data)

        client.get("/api/py/signin-status")

        assert called == []


class TestZeroSessions:
    @pytest.mark.parametrize("route", PERIOD_ROUTES)
    def test_an_account_with_no_sessions(self, client, signed_in, route):
        signed_in(sessions=[])
        assert client.get(route).json() == {"zero_sessions": True}

    @pytest.mark.parametrize("route", PERIOD_ROUTES)
    def test_a_user_who_booked_but_never_showed_up(self, client, signed_in,
                                                   route):
        # profile.totalSessionCount counts bookings, so guarding on it would
        # let this user through to min()/mean()/idxmax() on an empty frame
        signed_in(sessions=[
            day("2027-03-01", completed=False, joined=None, partner=None),
            day("2027-03-02", completed=False, joined=None, partner=None),
        ])
        assert client.get(route).json() == {"zero_sessions": True}

    def test_history_reports_zero_sessions_too(self, client, signed_in):
        signed_in(sessions=[])
        response = client.post("/api/py/history",
                               json={"page_index": 0, "page_size": 10})
        assert response.json() == {"zero_sessions": True}


class TestPeriodPayloads:
    def test_streak_payload_shape(self, client, signed_in, frozen_now,
                                  monkeypatch):
        frozen_now("2027-03-10 12:00")
        monkeypatch.setattr(api_index, "update_daily_streak",
                            lambda user_id, streak: False)
        signed_in()

        body = client.get("/api/py/streak").json()

        assert set(body) >= {
            "daily_streak", "daily_streak_increased", "weekly_streak",
            "monthly_streak", "max_daily_streak", "heatmap_data",
            "history_data", "daily", "charts"}
        assert body["daily"]["period_type"] == "day"

    def test_streak_history_is_capped_at_three_rows(self, client, signed_in,
                                                    frozen_now, monkeypatch):
        frozen_now("2027-03-10 12:00")
        monkeypatch.setattr(api_index, "update_daily_streak",
                            lambda user_id, streak: False)
        signed_in()
        assert len(client.get("/api/py/streak").json()["history_data"]) == 3

    def test_streak_reports_a_genuine_increase(self, client, signed_in,
                                               frozen_now, monkeypatch):
        frozen_now("2027-03-10 12:00")
        monkeypatch.setattr(api_index, "update_daily_streak",
                            lambda user_id, streak: True)
        signed_in()
        assert client.get("/api/py/streak").json()["daily_streak_increased"] \
            is True

    def test_week_payload_shape(self, client, signed_in, frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()

        body = client.get("/api/py/week").json()

        assert body["curr_period"]["period_type"] == "week"
        assert set(body["charts"]) == {
            "curr_period", "prev_period", "punctuality", "duration", "hour"}
        assert len(body["charts"]["curr_period"]) == 7

    def test_week_respects_the_week_start_parameter(self, client, signed_in,
                                                    frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()

        monday = client.get("/api/py/week?week_start=monday").json()
        sunday = client.get("/api/py/week?week_start=sunday").json()

        assert monday["curr_period"]["subheading"].startswith("Monday")
        assert sunday["curr_period"]["subheading"].startswith("Sunday")

    def test_week_rejects_an_unknown_week_start(self, client, signed_in):
        signed_in()
        assert client.get(
            "/api/py/week?week_start=tuesday").status_code == 422

    def test_month_payload_shape(self, client, signed_in, frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()
        body = client.get("/api/py/month").json()
        assert body["curr_period"]["period_type"] == "month"
        assert body["curr_period"]["subheading"] == "March 2027"

    def test_year_payload_shape(self, client, signed_in, frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()
        body = client.get("/api/py/year").json()
        assert body["curr_period"]["period_type"] == "year"
        assert body["curr_period"]["subheading"] == "2027"

    def test_year_previous_period_carries_its_own_totals(self, client,
                                                         signed_in,
                                                         frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in(sessions=BUSY_MONTH + [day("2026-05-01"), day("2026-05-02")])

        prev = client.get("/api/py/year").json()["prev_period"]

        assert prev["subheading"] == "2026"
        assert prev["sessions_total"] == 2
        assert set(prev) == {"subheading", "sessions_total", "hours_total",
                             "partners_total", "partners_repeat"}

    def test_lifetime_payload_shape(self, client, signed_in, frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()

        body = client.get("/api/py/lifetime").json()

        curr = body["curr_period"]
        assert curr["sessions_total"] == PROFILE["totalSessionCount"]
        assert curr["first_session_date"] == "March 1, 2027"
        assert curr["subheading"] == "March 1, 2027 - Present"
        assert "daily_record" in curr

    def test_deltas_reconcile_with_the_numbers_on_screen(self, client,
                                                         signed_in,
                                                         frozen_now):
        # Deltas come off the rounded hours, so a user can always subtract the
        # two figures they can see and get the third
        frozen_now("2027-03-10 12:00")
        signed_in(sessions=[
            day("2027-03-10", duration=25),
            day("2027-03-09", duration=75),
        ])

        daily = client.get("/api/py/streak").json()["daily"]

        assert daily["hours_total"] == 0.4
        assert daily["hours_delta"] == pytest.approx(0.4 - 1.2, abs=1e-9)


class TestProfilePhoto:
    def test_returns_the_photo_url(self, client, signed_in):
        signed_in()
        assert client.get("/api/py/profile-photo").json() == {
            "photo_url": PROFILE["photoUrl"]}

    def test_a_profile_without_a_photo_returns_null(self, client, signed_in):
        signed_in(profile={**PROFILE, "photoUrl": None})
        assert client.get("/api/py/profile-photo").json() == {
            "photo_url": None}


class TestGoal:
    @pytest.fixture(autouse=True)
    def stub_store(self, monkeypatch):
        store = {"goal": 5, "goal_type": "sessions"}
        monkeypatch.setattr(api_index, "get_weekly_goal",
                            lambda user_id: dict(store))

        def update(user_id, goal, goal_type):
            store.update(goal=goal, goal_type=goal_type)
            return dict(store)

        monkeypatch.setattr(api_index, "update_weekly_goal", update)
        return store

    def test_get_returns_the_goal_and_the_limits(self, client, signed_in):
        signed_in()
        body = client.get("/api/py/goal").json()
        assert body["goal"] == 5
        assert body["goal_type"] == "sessions"
        # Sent so the client enforces the same bounds without its own copy
        assert body["max_sessions"] == GOAL_LIMITS["max_sessions"]
        assert body["max_minutes"] == GOAL_LIMITS["max_minutes"]

    def test_setting_a_session_goal(self, client, signed_in):
        signed_in()
        body = client.post("/api/py/goal",
                           json={"goal": 12, "goal_type": "sessions"}).json()
        assert body["goal"] == 12

    def test_setting_an_hours_goal_in_minutes(self, client, signed_in):
        signed_in()
        body = client.post("/api/py/goal",
                           json={"goal": 600, "goal_type": "hours"}).json()
        assert (body["goal"], body["goal_type"]) == (600, "hours")

    def test_zero_clears_the_goal(self, client, signed_in):
        signed_in()
        assert client.post("/api/py/goal", json={"goal": 0}).json()["goal"] == 0

    def test_goal_type_defaults_to_sessions(self, client, signed_in):
        signed_in()
        assert client.post(
            "/api/py/goal", json={"goal": 3}).json()["goal_type"] == "sessions"

    @pytest.mark.parametrize("payload", [
        {"goal": -1},
        {"goal": 337},                              # a week holds 336 slots
        {"goal": 10081, "goal_type": "hours"},      # a week holds 10080 mins
        {"goal": 5, "goal_type": "weeks"},
        {"goal": "many"},
        {},
    ])
    def test_rejects_an_impossible_goal(self, client, signed_in, payload):
        signed_in()
        assert client.post("/api/py/goal", json=payload).status_code == 422

    @pytest.mark.parametrize("payload", [
        {"goal": 336, "goal_type": "sessions"},
        {"goal": 10080, "goal_type": "hours"},
    ])
    def test_accepts_the_boundary(self, client, signed_in, payload):
        signed_in()
        assert client.post("/api/py/goal", json=payload).status_code == 200

    def test_an_hours_goal_may_exceed_the_session_limit(self, client,
                                                        signed_in):
        # 400 minutes is a reasonable week and well past the 336 that bounds a
        # session goal, so the two limits must not be conflated
        signed_in()
        assert client.post(
            "/api/py/goal",
            json={"goal": 400, "goal_type": "hours"}).status_code == 200


class TestHistory:
    def test_returns_a_page_and_the_total(self, client, signed_in,
                                          frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()
        body = client.post("/api/py/history",
                           json={"page_index": 0, "page_size": 4}).json()
        assert len(body["rows"]) == 4
        assert body["row_count"] == 9

    def test_pages_do_not_overlap(self, client, signed_in, frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()
        first = client.post("/api/py/history",
                            json={"page_index": 0, "page_size": 4}).json()
        second = client.post("/api/py/history",
                             json={"page_index": 1, "page_size": 4}).json()
        first_ids = {row["session_id"] for row in first["rows"]}
        second_ids = {row["session_id"] for row in second["rows"]}
        assert first_ids.isdisjoint(second_ids)

    def test_a_page_past_the_end_is_empty(self, client, signed_in,
                                          frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()
        body = client.post("/api/py/history",
                           json={"page_index": 99, "page_size": 10}).json()
        assert body["rows"] == []
        assert body["row_count"] == 9

    @pytest.mark.parametrize("payload", [
        {"page_index": -1, "page_size": 10},
        {"page_index": 0, "page_size": -5},
        {"page_index": 0, "page_size": 0},
    ])
    def test_rejects_nonsense_pagination(self, client, signed_in, frozen_now,
                                         payload):
        # A negative index produces a negative slice, which quietly returns
        # rows from the end of the history instead of an error
        frozen_now("2027-03-10 12:00")
        signed_in()
        assert client.post(
            "/api/py/history", json=payload).status_code == 422

    def test_history_all_returns_every_row(self, client, signed_in,
                                           frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in()
        assert len(client.get("/api/py/history-all").json()) == 9

    def test_history_all_on_an_empty_account(self, client, signed_in):
        signed_in(sessions=[])
        assert client.get("/api/py/history-all").json() == []

    def test_history_includes_sessions_that_were_not_completed(
            self, client, signed_in, frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in(sessions=[
            day("2027-03-01"),
            day("2027-03-02", completed=False, joined=None, partner=None),
        ])
        rows = client.get("/api/py/history-all").json()
        assert len(rows) == 2
        assert [row["completed"] for row in rows] == [False, True]

    def test_history_excludes_future_bookings(self, client, signed_in,
                                              frozen_now):
        frozen_now("2027-03-10 12:00")
        signed_in(sessions=[day("2027-03-01"), day("2027-03-20")])
        assert len(client.get("/api/py/history-all").json()) == 1


class TestSessionFrameIsNotMutated:
    def test_filtering_to_completed_does_not_touch_the_cached_frame(
            self, client, signed_in, frozen_now, monkeypatch):
        # The frame handed back by get_data lives in a TTL cache shared by
        # every request for that session, so a route that mutated it would
        # corrupt the next one
        frozen_now("2027-03-10 12:00")
        monkeypatch.setattr(api_index, "update_daily_streak",
                            lambda user_id, streak: False)
        frame = signed_in(sessions=BUSY_MONTH + [
            day("2027-03-05", completed=False, joined=None, partner=None)])
        before = frame.copy(deep=True)

        client.get("/api/py/streak")
        client.get("/api/py/week")
        client.get("/api/py/lifetime")

        pd.testing.assert_frame_equal(frame, before)
