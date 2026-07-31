"""Streaks, partner counts and records.

Streaks are the app's most visible number and the one users will argue with,
so the rules get spelled out here: a missed weekend does not break a daily
streak, today's absence does not break it either, and today's presence extends
it.
"""

import pandas as pd
import pytest

from api_utils.metric import (
    calc_curr_streak,
    calc_daily_record,
    calc_max_daily_streak,
    calc_repeat_partners,
)
from tests.conftest import make_sessions

# Anchor week: 2027-03-01 is a Monday, so
#   Mon 03-01  Tue 03-02  Wed 03-03  Thu 03-04  Fri 03-05
#   Sat 03-06  Sun 03-07  Mon 03-08  Tue 03-09  Wed 03-10
TZ = "UTC"


def day(date, **kwargs):
    return {"start": f"{date} 10:00", **kwargs}


class TestRepeatPartners:
    def test_counts_partners_seen_more_than_once(self):
        sessions = make_sessions([
            day("2027-03-01", partner="alice"),
            day("2027-03-02", partner="alice"),
            day("2027-03-03", partner="bob"),
        ])
        assert calc_repeat_partners(sessions) == 1

    def test_a_partner_seen_three_times_still_counts_once(self):
        sessions = make_sessions([
            day("2027-03-01", partner="alice"),
            day("2027-03-02", partner="alice"),
            day("2027-03-03", partner="alice"),
        ])
        assert calc_repeat_partners(sessions) == 1

    def test_no_repeats_is_zero(self):
        sessions = make_sessions([
            day("2027-03-01", partner="alice"),
            day("2027-03-02", partner="bob"),
        ])
        assert calc_repeat_partners(sessions) == 0

    def test_unmatched_sessions_do_not_group_into_a_phantom_partner(self):
        # value_counts() drops nulls. If they grouped, two unmatched sessions
        # would read as one partner met twice.
        sessions = make_sessions([
            day("2027-03-01", partner=None),
            day("2027-03-02", partner=None),
            day("2027-03-03", partner=None),
        ])
        assert calc_repeat_partners(sessions) == 0

    def test_empty_frame_is_zero(self):
        assert calc_repeat_partners(make_sessions([])) == 0


class TestCurrentDailyStreak:
    def test_counts_consecutive_days_up_to_yesterday(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-08"), day("2027-03-09")])
        assert calc_curr_streak(sessions, "D", TZ) == 2

    def test_today_extends_the_streak(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([
            day("2027-03-08"), day("2027-03-09"), day("2027-03-10"),
        ])
        assert calc_curr_streak(sessions, "D", TZ) == 3

    def test_no_session_today_does_not_break_the_streak(self, frozen_now):
        # The day is not over yet, so it cannot count against the user
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-08"), day("2027-03-09")])
        assert calc_curr_streak(sessions, "D", TZ) == 2

    def test_a_missed_weekday_breaks_the_streak(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        # Nothing on Tuesday the 9th
        sessions = make_sessions([day("2027-03-08"), day("2027-03-10")])
        assert calc_curr_streak(sessions, "D", TZ) == 1

    def test_a_missed_weekend_does_not_break_the_streak(self, frozen_now):
        frozen_now("2027-03-09 12:00")
        sessions = make_sessions([day("2027-03-05"), day("2027-03-08")])
        assert calc_curr_streak(sessions, "D", TZ) == 2

    def test_weekend_can_be_made_to_break_the_streak(self, frozen_now):
        frozen_now("2027-03-09 12:00")
        sessions = make_sessions([day("2027-03-05"), day("2027-03-08")])
        assert calc_curr_streak(
            sessions, "D", TZ, weekend_breaks_daily_streak=True) == 1

    def test_several_sessions_in_one_day_count_once(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([
            {"start": "2027-03-09 09:00"},
            {"start": "2027-03-09 14:00"},
            {"start": "2027-03-09 18:00"},
        ])
        assert calc_curr_streak(sessions, "D", TZ) == 1

    def test_a_single_session_today_is_a_streak_of_one(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        assert calc_curr_streak(make_sessions([day("2027-03-10")]),
                                "D", TZ) == 1

    def test_an_old_lapsed_streak_counts_as_zero(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-01-04"), day("2027-01-05")])
        assert calc_curr_streak(sessions, "D", TZ) == 0


class TestCurrentWeeklyAndMonthlyStreak:
    def test_weekly_streak_counts_consecutive_weeks(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([
            day("2027-02-23"),  # week of Feb 22
            day("2027-03-02"),  # week of Mar 1
            day("2027-03-09"),  # current week
        ])
        assert calc_curr_streak(sessions, "W", TZ) == 3

    def test_a_skipped_week_breaks_the_weekly_streak(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-02-23"), day("2027-03-09")])
        assert calc_curr_streak(sessions, "W", TZ) == 1

    def test_week_start_preference_changes_the_answer(self, frozen_now):
        # Sunday 2027-03-07 closes the Mar 1 week under a Monday start, but
        # opens a fresh week under a Sunday start
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-02"), day("2027-03-07")])
        monday = calc_curr_streak(sessions, "W", TZ, week_start="monday")
        sunday = calc_curr_streak(sessions, "W", TZ, week_start="sunday")
        assert monday == 1  # both sessions sit in the current Monday-week
        assert sunday == 2  # Mar 2 in the prior week, Mar 7 in the current one

    def test_monthly_streak_counts_consecutive_months(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([
            day("2027-01-15"), day("2027-02-15"), day("2027-03-05"),
        ])
        assert calc_curr_streak(sessions, "M", TZ) == 3

    def test_a_skipped_month_breaks_the_monthly_streak(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-01-15"), day("2027-03-05")])
        assert calc_curr_streak(sessions, "M", TZ) == 1

    def test_no_session_this_month_keeps_the_prior_run(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-01-15"), day("2027-02-15")])
        assert calc_curr_streak(sessions, "M", TZ) == 2


class TestMaxDailyStreak:
    def test_finds_the_longest_run(self, frozen_now):
        sessions = make_sessions([
            day("2027-03-01"), day("2027-03-02"), day("2027-03-03"),
            # gap
            day("2027-03-10"),
        ])
        result = calc_max_daily_streak(sessions)
        assert result["count"] == 3
        assert result["date_range"] == [
            pd.Timestamp("2027-03-01").date(),
            pd.Timestamp("2027-03-03").date(),
        ]

    def test_a_run_at_the_end_of_the_frame_still_wins(self, frozen_now):
        sessions = make_sessions([
            day("2027-03-01"),
            day("2027-03-08"), day("2027-03-09"), day("2027-03-10"),
        ])
        assert calc_max_daily_streak(sessions)["count"] == 3

    def test_a_single_session_is_a_streak_of_one(self):
        result = calc_max_daily_streak(make_sessions([day("2027-03-01")]))
        assert result["count"] == 1
        assert result["date_range"] == [pd.Timestamp("2027-03-01").date()] * 2

    def test_bridges_a_real_weekend(self):
        # Friday then Monday, with the weekend genuinely skipped
        sessions = make_sessions([day("2027-03-05"), day("2027-03-08")])
        assert calc_max_daily_streak(sessions)["count"] == 2

    def test_bridges_saturday_to_monday(self):
        sessions = make_sessions([day("2027-03-06"), day("2027-03-08")])
        assert calc_max_daily_streak(sessions)["count"] == 2

    def test_bridges_friday_to_sunday(self):
        sessions = make_sessions([day("2027-03-05"), day("2027-03-07")])
        assert calc_max_daily_streak(sessions)["count"] == 2

    def test_a_weeks_long_gap_is_not_a_weekend(self):
        # Friday 5 March and Monday 15 March are ten days apart. Matching on
        # weekday alone made them consecutive, so a user who worked one Friday
        # and one Monday a fortnight later was shown a two-day streak.
        sessions = make_sessions([day("2027-03-05"), day("2027-03-15")])
        assert calc_max_daily_streak(sessions)["count"] == 1

    def test_a_month_long_gap_between_a_friday_and_a_monday(self):
        sessions = make_sessions([day("2027-03-05"), day("2027-04-05")])
        assert calc_max_daily_streak(sessions)["count"] == 1

    def test_weekend_bridging_can_be_turned_off(self):
        sessions = make_sessions([day("2027-03-05"), day("2027-03-08")])
        assert calc_max_daily_streak(
            sessions, weekend_breaks_daily_streak=True)["count"] == 1

    def test_several_sessions_in_one_day_count_once(self):
        sessions = make_sessions([
            {"start": "2027-03-01 09:00"},
            {"start": "2027-03-01 15:00"},
            {"start": "2027-03-02 09:00"},
        ])
        assert calc_max_daily_streak(sessions)["count"] == 2

    def test_out_of_order_input_is_handled(self):
        # get_data has no ordering guarantee; the yearly fetches are gathered
        # concurrently and concatenated
        sessions = make_sessions([
            day("2027-03-03"), day("2027-03-01"), day("2027-03-02"),
        ])
        assert calc_max_daily_streak(sessions)["count"] == 3


class TestDailyRecord:
    def test_reports_the_heaviest_day(self):
        sessions = make_sessions([
            day("2027-03-01", duration=25),
            day("2027-03-02", duration=75),
            {"start": "2027-03-02 14:00", "duration": 75},
        ])
        record = calc_daily_record(sessions)
        assert record["date"] == "Mar 2, 2027"
        assert record["duration"] == 2.5  # 150 minutes, to one decimal hour

    def test_ties_pick_the_earliest_day(self):
        sessions = make_sessions([
            day("2027-03-01", duration=50),
            day("2027-03-02", duration=50),
        ])
        assert calc_daily_record(sessions)["date"] == "Mar 1, 2027"

    def test_strips_the_leading_zero_from_the_day(self):
        sessions = make_sessions([day("2027-03-05", duration=25)])
        assert calc_daily_record(sessions)["date"] == "Mar 5, 2027"


class TestEmptyFrameGuards:
    """Every endpoint returns `zero_sessions` before reaching these, so an
    empty frame is a programming error rather than a user state. Pinning the
    behaviour keeps a future caller from quietly getting a wrong number
    instead of a loud failure."""

    def test_max_daily_streak_raises_on_an_empty_frame(self):
        with pytest.raises((AttributeError, IndexError, ValueError)):
            calc_max_daily_streak(make_sessions([]))

    def test_daily_record_raises_on_an_empty_frame(self):
        with pytest.raises((AttributeError, IndexError, ValueError)):
            calc_daily_record(make_sessions([]))
