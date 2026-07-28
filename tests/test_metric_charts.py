"""Chart payloads, the history table, and the pie summaries.

The chart builders all share one job beyond aggregating: filling in the periods
and duration buckets that had no sessions, so a sparse month still draws a full
axis instead of a ragged one.
"""

import pandas as pd
import pytest

from api_utils.metric import (
    ON_TIME_GRACE_SECONDS,
    calc_chart_data_by_hour,
    calc_chart_data_by_range,
    calc_cumulative_sessions_chart,
    calc_duration_pie_data,
    calc_heatmap_data,
    calc_history_data,
    calc_punctuality_pie_data,
    format_seconds,
)
from tests.conftest import make_sessions

TZ = "UTC"
DURATION_KEYS = {"25m", "50m", "75m"}


def day(date, **kwargs):
    return {"start": f"{date} 10:00", **kwargs}


class TestHeatmapData:
    def test_window_runs_from_a_year_back_to_tomorrow(self, frozen_now):
        frozen_now("2027-03-10 15:00")
        result = calc_heatmap_data(make_sessions([day("2027-03-01")]), TZ)
        # Nivo's `to` is exclusive, so it has to be tomorrow for today to show
        assert result["to"] == "2027-03-11"

    def test_window_starts_on_the_users_week_start(self, frozen_now):
        frozen_now("2027-03-10 15:00")
        sessions = make_sessions([day("2027-03-01")])

        monday = calc_heatmap_data(sessions, TZ, week_start="monday")
        sunday = calc_heatmap_data(sessions, TZ, week_start="sunday")

        assert pd.Timestamp(monday["from"]).weekday() == 0
        assert pd.Timestamp(sunday["from"]).weekday() == 6

    def test_counts_sessions_per_day(self, frozen_now):
        frozen_now("2027-03-10 15:00")
        sessions = make_sessions([
            {"start": "2027-03-01 09:00"},
            {"start": "2027-03-01 14:00"},
            {"start": "2027-03-02 09:00"},
        ])
        result = calc_heatmap_data(sessions, TZ)
        assert {"day": "2027-03-01", "value": 2} in result["data"]
        assert {"day": "2027-03-02", "value": 1} in result["data"]

    def test_excludes_sessions_older_than_the_window(self, frozen_now):
        frozen_now("2027-03-10 15:00")
        sessions = make_sessions([day("2020-01-01"), day("2027-03-01")])
        result = calc_heatmap_data(sessions, TZ)
        assert result["past_year_sessions"] == 1
        assert [entry["day"] for entry in result["data"]] == ["2027-03-01"]

    def test_includes_a_session_today(self, frozen_now):
        frozen_now("2027-03-10 15:00")
        result = calc_heatmap_data(make_sessions([day("2027-03-10")]), TZ)
        assert result["past_year_sessions"] == 1

    def test_empty_frame_yields_an_empty_calendar(self, frozen_now):
        frozen_now("2027-03-10 15:00")
        sessions = make_sessions([day("2020-01-01")])
        result = calc_heatmap_data(sessions, TZ)
        assert result["data"] == []
        assert result["past_year_sessions"] == 0


class TestChartDataByRange:
    def test_buckets_sessions_by_duration(self):
        sessions = make_sessions([
            day("2027-03-01", duration=25),
            day("2027-03-01", duration=25),
            day("2027-03-01", duration=50),
        ])
        rows = calc_chart_data_by_range(
            sessions, pd.Timestamp("2027-03-01"), pd.Timestamp("2027-03-01"),
            "D", "%-d")
        assert rows == [{"start_period_str": "1", "25m": 2, "50m": 1,
                         "75m": 0}]

    def test_pads_periods_that_had_no_sessions(self):
        sessions = make_sessions([day("2027-03-01"), day("2027-03-03")])
        rows = calc_chart_data_by_range(
            sessions, pd.Timestamp("2027-03-01"), pd.Timestamp("2027-03-03"),
            "D", "%-d")
        assert [row["start_period_str"] for row in rows] == ["1", "2", "3"]
        assert rows[1]["25m"] == 0

    def test_always_emits_all_three_duration_buckets(self):
        sessions = make_sessions([day("2027-03-01", duration=25)])
        rows = calc_chart_data_by_range(
            sessions, pd.Timestamp("2027-03-01"), pd.Timestamp("2027-03-01"),
            "D", "%-d")
        assert DURATION_KEYS <= set(rows[0])

    def test_an_empty_period_still_draws_a_full_axis(self):
        # A user with a quiet week should see seven empty bars, not no chart
        rows = calc_chart_data_by_range(
            make_sessions([]), pd.Timestamp("2027-03-01"),
            pd.Timestamp("2027-03-07"), "D", "%a")
        assert len(rows) == 7
        assert all(row["25m"] == 0 for row in rows)
        assert [row["start_period_str"] for row in rows] == [
            "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    def test_rows_come_back_in_chronological_order(self):
        sessions = make_sessions([day("2027-03-03"), day("2027-03-01")])
        rows = calc_chart_data_by_range(
            sessions, pd.Timestamp("2027-03-01"), pd.Timestamp("2027-03-05"),
            "D", "%-d")
        assert [row["start_period_str"] for row in rows] == \
            ["1", "2", "3", "4", "5"]

    def test_monthly_buckets(self):
        sessions = make_sessions([day("2027-01-15"), day("2027-03-20")])
        rows = calc_chart_data_by_range(
            sessions, pd.Timestamp("2027-01-01"), pd.Timestamp("2027-03-31"),
            "M", "%b")
        assert [row["start_period_str"] for row in rows] == \
            ["Jan", "Feb", "Mar"]
        assert [row["25m"] for row in rows] == [1, 0, 1]

    def test_weekly_buckets_follow_the_week_start_preference(self):
        # Sunday 2027-03-07 closes the Mar 1 week for a Monday start and opens
        # a new one for a Sunday start
        sessions = make_sessions([day("2027-03-07")])

        monday = calc_chart_data_by_range(
            sessions, pd.Timestamp("2027-03-01"), pd.Timestamp("2027-03-14"),
            "W", "%b %d", week_start="monday")
        sunday = calc_chart_data_by_range(
            sessions, pd.Timestamp("2027-03-01"), pd.Timestamp("2027-03-14"),
            "W", "%b %d", week_start="sunday")

        assert [row["25m"] for row in monday] == [1, 0]
        assert [row["25m"] for row in sunday] == [0, 1, 0]


class TestChartDataByHour:
    def test_returns_every_hour_of_the_day(self):
        rows = calc_chart_data_by_hour(make_sessions([day("2027-03-01")]))
        assert len(rows) == 24

    def test_starts_at_midnight_and_ends_at_eleven_pm(self):
        rows = calc_chart_data_by_hour(make_sessions([day("2027-03-01")]))
        assert rows[0]["start_time_hour"] == "12 AM"
        assert rows[-1]["start_time_hour"] == "11 PM"

    def test_places_a_session_in_its_hour(self):
        sessions = make_sessions([
            {"start": "2027-03-01 14:30", "duration": 50},
        ])
        rows = calc_chart_data_by_hour(sessions)
        two_pm = next(r for r in rows if r["start_time_hour"] == "2 PM")
        assert two_pm["50m"] == 1
        assert two_pm["25m"] == 0

    def test_strips_the_leading_zero_from_the_hour(self):
        rows = calc_chart_data_by_hour(make_sessions([
            {"start": "2027-03-01 09:00"},
        ]))
        labels = [row["start_time_hour"] for row in rows]
        assert "9 AM" in labels
        assert "09 AM" not in labels

    def test_always_emits_all_three_duration_buckets(self):
        rows = calc_chart_data_by_hour(make_sessions([day("2027-03-01")]))
        assert all(DURATION_KEYS <= set(row) for row in rows)

    def test_draws_a_full_empty_day(self):
        # /api/py/streak passes the sessions that started today, which is
        # empty for anyone opening the dashboard before their first session
        sessions = make_sessions([day("2027-03-01")])
        no_sessions_today = sessions[
            sessions["start_time"] >= pd.Timestamp("2027-03-10")]

        rows = calc_chart_data_by_hour(no_sessions_today)

        assert len(rows) == 24
        assert all(row["25m"] == 0 for row in rows)


class TestHistoryData:
    def test_returns_an_empty_list_for_an_empty_frame(self):
        assert calc_history_data(make_sessions([]), TZ) == []

    def test_sorts_most_recent_first(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-01"), day("2027-03-05")])
        rows = calc_history_data(sessions, TZ)
        assert [row["date"] for row in rows] == \
            ["Fri, Mar 05, 2027", "Mon, Mar 01, 2027"]

    def test_excludes_sessions_that_have_not_started_yet(self, frozen_now):
        # The sessions endpoint returns future bookings, and the history table
        # is a record of what happened
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-09"), day("2027-03-20")])
        rows = calc_history_data(sessions, TZ)
        assert len(rows) == 1
        assert rows[0]["date"] == "Tue, Mar 09, 2027"

    def test_uses_local_now_rather_than_the_servers_clock(self, frozen_now):
        # A session earlier today must appear; the frame is naive local, so
        # comparing against UTC would hide it for anyone east of UTC
        frozen_now("2027-03-10 23:00")
        sessions = make_sessions([{"start": "2027-03-10 22:00"}])
        assert len(calc_history_data(sessions, TZ)) == 1

    def test_head_limits_the_rows(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([
            day("2027-03-01"), day("2027-03-02"), day("2027-03-03"),
            day("2027-03-04"),
        ])
        assert len(calc_history_data(sessions, TZ, head=3)) == 3

    def test_reports_duration_in_minutes(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-01", duration=50)])
        assert calc_history_data(sessions, TZ)[0]["duration_minutes"] == 50

    def test_keeps_uncompleted_sessions(self, frozen_now):
        # History is the one view that shows no-shows
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-01", completed=False,
                                      joined=None)])
        rows = calc_history_data(sessions, TZ)
        assert len(rows) == 1
        assert bool(rows[0]["completed"]) is False

    def test_drops_the_columns_the_table_does_not_render(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        rows = calc_history_data(make_sessions([day("2027-03-01")]), TZ)
        assert set(rows[0]) == {
            "session_id", "completed", "session_title", "date", "time",
            "duration_minutes", "on_time"}

    def test_formats_the_time_with_a_meridiem(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([{"start": "2027-03-01 14:30"}])
        assert calc_history_data(sessions, TZ)[0]["time"] == "02:30 PM"

    @pytest.mark.parametrize("title", ["", "None"])
    def test_a_missing_title_reads_as_not_available(self, frozen_now, title):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-01", title=title)])
        assert calc_history_data(sessions, TZ)[0]["session_title"] == "N/A"

    def test_a_real_title_is_left_alone(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-01", title="Write the report")])
        assert calc_history_data(sessions, TZ)[0]["session_title"] == \
            "Write the report"


class TestOnTime:
    """The grace period is one definition shared with the punctuality chart --
    they used to disagree, so the same session could read "On time: Yes" in the
    table while the chart counted it late."""

    @pytest.mark.parametrize("joined,expected", [
        (-30, True),    # early
        (0, True),      # exactly on the hour
        (59, True),
        (60, True),     # the boundary is inclusive
        (61, False),
        (600, False),
    ])
    def test_grace_boundary(self, frozen_now, joined, expected):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-01", joined=joined)])
        assert bool(calc_history_data(sessions, TZ)[0]["on_time"]) is expected

    def test_never_joined_is_not_on_time(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([day("2027-03-01", joined=None,
                                      completed=False)])
        assert bool(calc_history_data(sessions, TZ)[0]["on_time"]) is False

    def test_matches_the_punctuality_chart(self, frozen_now):
        frozen_now("2027-03-10 12:00")
        sessions = make_sessions([
            day("2027-03-01", joined=ON_TIME_GRACE_SECONDS),
            day("2027-03-02", joined=ON_TIME_GRACE_SECONDS + 1),
        ])
        rows = calc_history_data(sessions, TZ)
        table_on_time = sum(1 for row in rows if row["on_time"])
        chart = calc_punctuality_pie_data(sessions)["data"]
        chart_on_time = next(
            entry["amount"] for entry in chart
            if entry["punctuality"] == "On time")
        assert table_on_time == chart_on_time == 1


class TestDurationPie:
    def test_counts_each_bucket(self):
        sessions = make_sessions([
            day("2027-03-01", duration=25),
            day("2027-03-02", duration=25),
            day("2027-03-03", duration=75),
        ])
        assert calc_duration_pie_data(sessions) == [
            {"duration": "25m", "amount": 2},
            {"duration": "50m", "amount": 0},
            {"duration": "75m", "amount": 1},
        ]

    def test_empty_frame_gives_three_zeroes(self):
        assert [entry["amount"] for entry in
                calc_duration_pie_data(make_sessions([]))] == [0, 0, 0]


class TestPunctualityPie:
    def test_splits_on_time_from_late(self):
        sessions = make_sessions([
            day("2027-03-01", joined=0),
            day("2027-03-02", joined=30),
            day("2027-03-03", joined=300),
        ])
        result = calc_punctuality_pie_data(sessions)
        assert result["data"] == [
            {"punctuality": "On time", "amount": 2},
            {"punctuality": "Late", "amount": 1},
        ]

    def test_reports_the_average_and_median(self):
        sessions = make_sessions([
            day("2027-03-01", joined=10),
            day("2027-03-02", joined=20),
            day("2027-03-03", joined=120),
        ])
        result = calc_punctuality_pie_data(sessions)
        assert result["avg"] == "50s late"
        assert result["median"] == "20s late"

    def test_never_joined_sessions_report_not_available(self):
        sessions = make_sessions([day("2027-03-01", joined=None)])
        result = calc_punctuality_pie_data(sessions)
        assert result["avg"] == "N/A"
        assert result["median"] == "N/A"

    def test_a_period_with_no_sessions_reports_zeroes(self):
        # The week and month views pass a trailing window that can be empty
        sessions = make_sessions([day("2027-03-01")])
        empty_window = sessions[
            sessions["start_time"] >= pd.Timestamp("2027-03-10")]

        result = calc_punctuality_pie_data(empty_window)

        assert [entry["amount"] for entry in result["data"]] == [0, 0]
        assert result["avg"] == "N/A"

    def test_does_not_mutate_the_caller_frame(self):
        # Every endpoint passes the same frame to several builders in turn
        sessions = make_sessions([day("2027-03-01", joined=10)])
        before = list(sessions.columns)
        calc_punctuality_pie_data(sessions)
        assert list(sessions.columns) == before


class TestFormatSeconds:
    @pytest.mark.parametrize("seconds,expected", [
        (0, "0s early"),
        (-30, "30s early"),
        (30, "30s late"),
        (61, "1m 1s late"),
        (-90, "1m 30s early"),
        (3600, "60m 0s late"),
    ])
    def test_wording(self, seconds, expected):
        assert format_seconds(seconds) == expected

    def test_nan_reads_as_not_available(self):
        assert format_seconds(float("nan")) == "N/A"

    def test_rounds_a_fractional_second(self):
        assert format_seconds(30.4) == "30s late"
        assert format_seconds(30.6) == "31s late"


class TestCumulativeSessionsChart:
    def test_accumulates_over_time(self):
        sessions = make_sessions([
            day("2027-03-01", duration=25),
            day("2027-03-02", duration=25),
            day("2027-03-03", duration=25),
        ])
        rows = calc_cumulative_sessions_chart(sessions)
        assert [row["25m"] for row in rows] == [1, 2, 3]

    def test_fills_in_days_with_no_sessions(self):
        sessions = make_sessions([
            day("2027-03-01", duration=25),
            day("2027-03-04", duration=25),
        ])
        rows = calc_cumulative_sessions_chart(sessions)
        assert len(rows) == 4
        # The line holds flat across the gap rather than dropping to zero
        assert [row["25m"] for row in rows] == [1, 1, 1, 2]

    def test_tracks_each_duration_separately(self):
        sessions = make_sessions([
            day("2027-03-01", duration=25),
            day("2027-03-02", duration=75),
        ])
        rows = calc_cumulative_sessions_chart(sessions)
        assert [row["25m"] for row in rows] == [1, 1]
        assert [row["75m"] for row in rows] == [0, 1]

    def test_formats_the_date_for_display(self):
        rows = calc_cumulative_sessions_chart(
            make_sessions([day("2027-03-05")]))
        assert rows[0]["start_date"] == "Mar 5, 2027"

    def test_is_monotonic(self):
        sessions = make_sessions([
            day("2027-03-01"), day("2027-03-02"), day("2027-03-05"),
        ])
        totals = [row["25m"] for row in calc_cumulative_sessions_chart(
            sessions)]
        assert totals == sorted(totals)
