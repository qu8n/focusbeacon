# Build the static demo fixture, and the golden payloads used to check it.
#
#     uv run scripts/generate_demo_fixture.py
#
# The demo dashboard does not call the API. It ships a fixture of fake sessions
# stored as offsets from "today" and rebuilds the payloads in the browser, so
# the data can never go stale and no serverless function wakes up. This script
# is the only place that fake data lives.
#
# Every anchor uses the same seed and the same 23:59:59 wall time, so a session
# lands the same number of days before its anchor whichever anchor is used.
# That invariant is what makes one fixture valid for every date, and it is
# asserted below rather than assumed.
#
# The goldens are the real endpoint payloads at a spread of anchors, which
# scripts/check-demo-fixture.ts replays against the TypeScript rebuild. They
# are regenerated on every check rather than committed.

import argparse
import asyncio
import datetime as dt
import json
import shutil
import sys
from pathlib import Path

import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

import api.index as api  # noqa: E402
from api_utils.time import set_now_override  # noqa: E402
from scripts.demo_faker import (  # noqa: E402
    DURATION_OPTIONS, FAKE_PROFILE, NUM_SESSIONS, build_demo_data)

DEFAULT_FIXTURE = REPO_ROOT / "lib" / "demo" / "fixture.json"

# The fixture is generated from the first of these. The rest exist to give the
# check a spread of calendar positions: month lengths, leap day, both ends of a
# year, and every weekday the current-period truncation has to cope with.
ANCHORS = [
    "2028-07-19",
    "2027-01-01",
    "2027-12-31",
    "2028-02-29",
    "2026-11-01",
    "2026-11-30",
    "2025-08-02",
    "2029-03-04",
]

DEMO_GOAL = {"goal": 10, "goal_type": "sessions"}
HISTORY_PAGE_SIZE = 10
HISTORY_PAGES = [0, 7]


def anchor_timestamp(day: str) -> pd.Timestamp:
    """Anchors sit at the last second of the day so that "today" is complete:
    the demo counts all of today's sessions, and calc_history_data's
    start_time < now filter has to agree with that."""
    return pd.Timestamp(f"{day} 23:59:59")


def encode_json(value):
    """Match what the client receives over the wire. Pandas hands back numpy
    scalars and date objects that json cannot write on its own."""
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return float(value)
    if isinstance(value, np.bool_):
        return bool(value)
    if isinstance(value, (pd.Timestamp, dt.datetime, dt.date)):
        return value.isoformat()
    raise TypeError(f"cannot serialize {type(value)!r}")


def session_rows(sessions: pd.DataFrame, anchor: pd.Timestamp) -> list:
    """One compact row per session: how many days before today it starts, the
    minute of the day it starts at, which of the three durations it runs for,
    how late the join was in seconds, whether it completed, and who the partner
    was. Everything the dashboard shows is derived from these six numbers."""
    anchor_date = anchor.normalize()
    rows = []

    for session in sessions.itertuples(index=False):
        start = session.start_time
        join_delta = None
        if pd.notna(session.joined_at):
            join_delta = int((session.joined_at - start).total_seconds())
        # An unmatched session carries a real null now, not the string "None"
        # that .astype(str) used to produce -- comparing pd.NA to a string
        # yields NA, which raises the moment it is used as a bool
        partner = (-1 if pd.isna(session.partner_id)
                   else int(session.partner_id.rsplit("-", 1)[1]))

        rows.append([
            int((start.normalize() - anchor_date).days),
            int(start.hour * 60 + start.minute),
            DURATION_OPTIONS.index(int(session.duration)),
            join_delta,
            int(bool(session.completed)),
            partner,
        ])

    return rows


def install_stubs(profile: dict, sessions: pd.DataFrame):
    """Feed the real endpoints fake data. Going through the endpoints rather
    than reimplementing them is the whole point: the goldens are then the live
    payload shape by construction."""
    async def fake_get_data(session_id, user_data_cache):
        return profile, sessions

    api.get_data = fake_get_data
    api.update_daily_streak = lambda user_id, daily_streak: False


async def endpoint_payloads(profile: dict, sessions: pd.DataFrame) -> dict:
    install_stubs(profile, sessions)
    payloads = {}

    for week_start in ("monday", "sunday"):
        payloads[f"streak.{week_start}"] = await api.get_streak(
            "demo", week_start=week_start)
        payloads[f"week.{week_start}"] = await api.get_week(
            "demo", week_start=week_start)

    payloads["month"] = await api.get_month("demo")
    payloads["year"] = await api.get_year("demo")
    payloads["lifetime"] = await api.get_lifetime("demo")

    for page in HISTORY_PAGES:
        payloads[f"history.{page}"] = await api.get_history_paginated(
            "demo", api.Pagination(
                page_index=page, page_size=HISTORY_PAGE_SIZE))

    return payloads


def build(anchor: pd.Timestamp):
    set_now_override(anchor)
    try:
        profile, sessions = build_demo_data(anchor)
        payloads = asyncio.run(endpoint_payloads(profile, sessions))
    finally:
        set_now_override(None)
    return session_rows(sessions, anchor), payloads


def main():
    parser = argparse.ArgumentParser(
        description="Generate the static demo fixture and its goldens")
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE)
    parser.add_argument("--goldens", type=Path, default=None,
                        help="write golden payloads here, one file per anchor")
    args = parser.parse_args()

    reference_rows = None
    goldens = {}

    for day in ANCHORS:
        anchor = anchor_timestamp(day)
        rows, payloads = build(anchor)

        if reference_rows is None:
            reference_rows = rows
        elif rows != reference_rows:
            raise SystemExit(
                f"anchor {day} produced different session offsets than "
                f"{ANCHORS[0]}, so one fixture cannot serve every date")

        goldens[day] = {
            "anchor": day,
            "weekday": anchor.strftime("%A"),
            "payloads": payloads,
        }

    fixture = {
        "profile": {
            "total_session_count": NUM_SESSIONS,
            "time_zone": FAKE_PROFILE["timeZone"],
        },
        "goal": {**DEMO_GOAL, **api.GOAL_LIMITS},
        "duration_ms": DURATION_OPTIONS,
        "history_page_size": HISTORY_PAGE_SIZE,
        "sessions": reference_rows,
    }

    args.fixture.parent.mkdir(parents=True, exist_ok=True)
    args.fixture.write_text(
        json.dumps(fixture, separators=(",", ":"), sort_keys=True) + "\n")
    print(f"wrote {args.fixture} ({len(reference_rows)} sessions)")

    if args.goldens:
        if args.goldens.exists():
            shutil.rmtree(args.goldens)
        args.goldens.mkdir(parents=True)
        for day, golden in goldens.items():
            (args.goldens / f"{day}.json").write_text(
                json.dumps(golden, default=encode_json, sort_keys=True) + "\n")
        print(f"wrote {len(goldens)} goldens to {args.goldens}")


if __name__ == "__main__":
    main()
