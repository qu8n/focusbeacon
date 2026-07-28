"""Shared fixtures for the Python suite.

Two things happen here before anything else can import cleanly:

1. Fake credentials go into the environment. `api_utils/config.py` reads every
   setting at import time and `api_utils/supabase.py` builds a client from
   them, so they have to exist before the first `api_utils` import anywhere in
   the run. `load_dotenv()` does not override variables that are already set,
   which is what keeps a developer's real `.env` -- and their real Supabase
   project -- out of the tests.
2. The repo root goes on `sys.path`, so `api` and `api_utils` resolve the same
   way they do under uvicorn.
"""

import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

TEST_ENV = {
    "SUPABASE_PROJECT_URL": "https://test.supabase.co",
    "SUPABASE_SERVICE_ROLE_KEY": "test-service-role-key",
    # 32 bytes of hex: a real AES-256 key, just not a secret one
    "ENCRYPTION_KEY": "00112233445566778899aabbccddeeff"
                      "00112233445566778899aabbccddeeff",
    "NEXT_PUBLIC_SESSION_COOKIE_NAME": "sessionId",
    "NEXT_PUBLIC_FM_API_URL": "https://api.focusmate.test",
    "NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT": "/v1/me",
    "NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT": "/v1/sessions",
}
for key, value in TEST_ENV.items():
    os.environ.setdefault(key, value)

import pandas as pd  # noqa: E402
import pytest  # noqa: E402

from api_utils.lst_to_df import SESSION_COLUMNS  # noqa: E402
from api_utils.time import set_now_override  # noqa: E402

DURATION_MS = {25: 1500000, 50: 3000000, 75: 4500000}


@pytest.fixture
def frozen_now():
    """Pin the clock every `api_utils.time` helper reads.

    The module already supports this for the demo fixture generator, so the
    tests reuse it rather than pulling in freezegun. Yields a setter; the
    override is always cleared, including when the test fails.
    """
    def freeze(when):
        set_now_override(pd.Timestamp(when))
        return pd.Timestamp(when)

    try:
        yield freeze
    finally:
        set_now_override(None)


def make_sessions(specs) -> pd.DataFrame:
    """Build a session frame shaped exactly like `sessions_ls_to_df` output.

    `specs` is a list of dicts. Only `start` is required:

        start        str or Timestamp -- naive local, as the real frame stores
        duration     minutes: 25, 50 or 75 (default 25)
        joined       seconds relative to start, negative for early (default 0);
                     None means the session was never joined
        completed    default True
        partner      partner id, or None for an unmatched session
        title        session title (default "Focus")
        session_id   defaults to a positional id

    Dtypes match the real frame, which matters: `partner_id` is the nullable
    "string" dtype rather than object, so a missing partner stays <NA> instead
    of becoming the literal "None".
    """
    rows = []
    for index, spec in enumerate(specs):
        start = pd.Timestamp(spec["start"])
        joined = spec.get("joined", 0)
        rows.append({
            "session_id": spec.get("session_id", f"session-{index:04d}"),
            "duration": DURATION_MS[spec.get("duration", 25)],
            "start_time": start,
            "requested_at": start - pd.Timedelta(days=1),
            "joined_at": (pd.NaT if joined is None
                          else start + pd.Timedelta(seconds=joined)),
            "completed": spec.get("completed", True),
            "session_title": spec.get("title", "Focus"),
            "partner_id": spec.get("partner"),
        })

    frame = pd.DataFrame(rows, columns=SESSION_COLUMNS)
    if frame.empty:
        return frame

    frame["session_id"] = frame["session_id"].astype(str)
    frame["duration"] = frame["duration"].astype(int)
    frame["completed"] = frame["completed"].astype(bool)
    frame["session_title"] = frame["session_title"].astype(str)
    frame["partner_id"] = frame["partner_id"].astype("string")
    for column in ("start_time", "requested_at", "joined_at"):
        frame[column] = pd.to_datetime(frame[column])
    return frame


def empty_sessions() -> pd.DataFrame:
    """A frame with the right columns and no rows, as a brand-new account
    produces."""
    return make_sessions([])


@pytest.fixture
def sessions_factory():
    return make_sessions


def raw_session(
    session_id="fm-session-1",
    duration=1500000,
    start_time="2027-03-01T14:00:00Z",
    requested_at="2027-02-28T09:00:00Z",
    joined_at="2027-03-01T14:00:00Z",
    completed=True,
    title="Focus",
    partner_id="partner-1",
):
    """One session in the shape the Focusmate API returns it.

    The caller's own entry is always `users[0]`; a partner, when there is one,
    is `users[1]`.
    """
    users = [{
        "userId": "me",
        "requestedAt": requested_at,
        "joinedAt": joined_at,
        "completed": completed,
        "sessionTitle": title,
    }]
    if partner_id is not None:
        users.append({"userId": partner_id})

    return {
        "sessionId": session_id,
        "duration": duration,
        "startTime": start_time,
        "users": users,
    }
