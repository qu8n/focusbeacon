# Generate fake data shaped like the Focusmate API returns, for the demo
# dashboard. This runs offline from generate_demo_fixture.py and is excluded
# from the Vercel bundle: the demo reads a committed fixture, so nothing here
# executes at request time.
#
# Sessions are positioned relative to a `now` passed in rather than to the real
# clock, so the same seed produces the same history whichever date it is
# anchored to. That is what lets the fixture be checked against several dates.

import random
from datetime import timedelta
import pandas as pd
from api_utils.lst_to_df import sessions_ls_to_df

SEED = 20260726
NUM_SESSIONS = 1500
SPAN_DAYS = 730

DEMO_USER_ID = "demo-user"
FAKE_PROFILE = {
    "userId": DEMO_USER_ID,
    "name": "John Doe",
    "totalSessionCount": NUM_SESSIONS,
    "timeZone": "Etc/UTC",
}

DURATION_OPTIONS = [1500000, 3000000, 4500000]
DURATION_WEIGHTS = [0.5, 0.4, 0.1]
HOURS = list(range(24))
HOUR_WEIGHTS = [1 if 9 <= hour <= 18 else 0.05 for hour in HOURS]
MINUTE_OPTIONS = [0, 15, 30, 45]
COMPLETED_WEIGHTS = [1, 0.05]

# A few partners the demo user books with over and over, plus a long tail of
# one-offs. Drawing a fresh partner for every session, as this used to, leaves
# the "repeat partners" stat reading 0 on every tab.
REGULAR_PARTNERS = 10
REGULAR_WEIGHT = 40
CASUAL_PARTNERS = 1000

# Focusmate lets you join after the start. Most joins land in the ten minutes
# before it, but a slice arrives late, which is what gives the punctuality
# chart two slices instead of one.
LATE_JOIN_SHARE = 0.12
EARLY_JOIN_SECONDS = (-600, 60)
LATE_JOIN_SECONDS = (61, 420)


def partner_pool() -> tuple[list[str], list[int]]:
    ids = [f"demo-partner-{i:04d}"
           for i in range(REGULAR_PARTNERS + CASUAL_PARTNERS)]
    weights = [REGULAR_WEIGHT] * REGULAR_PARTNERS + [1] * CASUAL_PARTNERS
    return ids, weights


def _claim_free_slot(day, taken: set) -> tuple[int, int]:
    """Pick an hour and minute nobody else has on `day`. You cannot sit in two
    sessions at once, and unique start times also keep the history table's
    sort order unambiguous, which matters because the TypeScript rebuild has
    to reproduce it exactly."""
    for _ in range(20):
        hour = random.choices(HOURS, weights=HOUR_WEIGHTS, k=1)[0]
        minute = random.choice(MINUTE_OPTIONS)
        if (day, hour, minute) not in taken:
            taken.add((day, hour, minute))
            return hour, minute

    for hour in HOURS:
        for minute in MINUTE_OPTIONS:
            if (day, hour, minute) not in taken:
                taken.add((day, hour, minute))
                return hour, minute

    raise RuntimeError(f"every slot on {day} is taken")


def generate_fake_sessions(now: pd.Timestamp,
                           num_sessions: int = NUM_SESSIONS) -> list:
    random.seed(SEED)
    partner_ids, partner_weights = partner_pool()
    span_seconds = SPAN_DAYS * 86400
    taken_slots = set()
    sessions = []

    for index in range(num_sessions):
        start_time = now - timedelta(
            seconds=random.randint(0, span_seconds))
        hour, minute = _claim_free_slot(start_time.date(), taken_slots)
        start_time = start_time.replace(
            hour=hour, minute=minute, second=0, microsecond=0)
        requested_at = start_time - timedelta(
            seconds=random.randint(0, 86400))
        completed = random.choices(
            [True, False], weights=COMPLETED_WEIGHTS, k=1)[0]
        duration = random.choices(
            DURATION_OPTIONS, weights=DURATION_WEIGHTS, k=1)[0]
        partner_id = random.choices(
            partner_ids, weights=partner_weights, k=1)[0]

        joined_at = None
        if completed:
            if random.random() < LATE_JOIN_SHARE:
                join_delta = random.randint(*LATE_JOIN_SECONDS)
            else:
                join_delta = random.randint(*EARLY_JOIN_SECONDS)
            joined_at = start_time + timedelta(seconds=join_delta)
            # You cannot join a session before you booked it
            joined_at = max(joined_at, requested_at)

        session = {
            "sessionId": f"demo-session-{index:04d}",
            "duration": str(duration),
            "startTime": start_time.isoformat(),
            "users": [
                {
                    "userId": DEMO_USER_ID,
                    "sessionTitle": "",
                    "requestedAt": requested_at.isoformat(),
                    "joinedAt": (joined_at.isoformat()
                                 if joined_at is not None else None),
                    "completed": completed,
                }
            ],
        }
        if completed:
            session["users"].append({"userId": partner_id})

        sessions.append(session)

    return sessions


def build_demo_data(now: pd.Timestamp) -> tuple[dict, pd.DataFrame]:
    """The profile and sessions dataframe the API endpoints expect from
    `get_data`, anchored at `now`."""
    sessions = generate_fake_sessions(now)
    return FAKE_PROFILE, sessions_ls_to_df(
        sessions, FAKE_PROFILE["timeZone"])
