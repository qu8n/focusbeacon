"""Unit conversions and the period boundaries every dashboard card is cut on.

The boundary helpers all read the clock through `get_naive_local_today`, so
each test here pins it with `frozen_now` rather than asserting against a real
"now" that changes between runs.
"""

import pandas as pd
import pytest

from api_utils.time import (
    dt_to_fm_time_str,
    fm_time_str_to_dt,
    fm_time_str_to_local_dt,
    format_date_label,
    get_curr_day_start,
    get_curr_month_start,
    get_curr_week_start,
    get_curr_year_start,
    local_dt_to_utc_dt,
    m_to_ms,
    ms_to_h_decimal,
    ms_to_m,
    utc_dt_to_local_dt,
)


class TestDurationConversions:
    @pytest.mark.parametrize("ms,expected", [
        (0, 0),
        (1500000, 25),
        (3000000, 50),
        (4500000, 75),
    ])
    def test_ms_to_m_covers_the_three_session_lengths(self, ms, expected):
        assert ms_to_m(ms) == expected

    def test_ms_to_m_uses_bankers_rounding_at_a_tie(self):
        # Python's round() breaks ties to even. The demo's TypeScript port
        # reproduces this deliberately (lib/demo/time.ts pyRound), so if this
        # ever changes the two sides of the app stop agreeing.
        assert ms_to_m(int(0.5 * 60000)) == 0
        assert ms_to_m(int(1.5 * 60000)) == 2
        assert ms_to_m(int(2.5 * 60000)) == 2
        assert ms_to_m(int(3.5 * 60000)) == 4

    def test_ms_to_h_decimal_keeps_one_place(self):
        # Three 25-minute sessions: 1.25h, which whole hours would flatten to 1
        assert ms_to_h_decimal(3 * 1500000) == 1.2
        assert ms_to_h_decimal(1500000) == 0.4
        assert ms_to_h_decimal(0) == 0.0

    def test_ms_to_h_decimal_returns_a_float_not_an_int(self):
        # The client formats this value; an int would render "1" where the
        # card is meant to read "1.0"
        assert isinstance(ms_to_h_decimal(3600000), float)

    def test_m_to_ms_round_trips_against_ms_to_m(self):
        for minutes in (25, 50, 75):
            assert ms_to_m(m_to_ms(minutes)) == minutes


class TestTimezoneConversions:
    def test_utc_to_local_shifts_the_wall_clock(self):
        utc = pd.Timestamp("2027-03-01T14:00:00").to_pydatetime()
        local = utc_dt_to_local_dt(utc, "America/New_York")
        assert local.hour == 9  # UTC-5 in March, before US DST starts

    def test_local_to_utc_is_the_inverse(self):
        local = pd.Timestamp("2027-03-01T09:00:00").to_pydatetime()
        assert local_dt_to_utc_dt(local, "America/New_York").hour == 14

    def test_conversion_respects_daylight_saving(self):
        # 2027-07-01 is EDT (UTC-4), not EST (UTC-5)
        utc = pd.Timestamp("2027-07-01T14:00:00").to_pydatetime()
        assert utc_dt_to_local_dt(utc, "America/New_York").hour == 10

    def test_fm_time_str_parses_the_api_format(self):
        parsed = fm_time_str_to_dt("2027-03-01T14:00:00Z")
        assert (parsed.year, parsed.month, parsed.day) == (2027, 3, 1)
        assert parsed.hour == 14

    def test_fm_time_str_helpers_pass_none_through(self):
        # An incomplete session has no joinedAt, and the frame keeps that as
        # NaT rather than inventing a time
        assert fm_time_str_to_dt(None) is None
        assert fm_time_str_to_local_dt(None, "America/New_York") is None

    def test_dt_to_fm_time_str_round_trips(self):
        original = "2027-03-01T14:00:00Z"
        assert dt_to_fm_time_str(fm_time_str_to_dt(original)) == original


class TestPeriodStarts:
    def test_day_start_strips_the_time(self, frozen_now):
        frozen_now("2027-03-10 15:42:07")
        assert get_curr_day_start("UTC") == pd.Timestamp("2027-03-10 00:00:00")

    @pytest.mark.parametrize("today,expected", [
        ("2027-03-10", "2027-03-08"),  # Wednesday -> that Monday
        ("2027-03-08", "2027-03-08"),  # Monday is its own week start
        ("2027-03-14", "2027-03-08"),  # Sunday belongs to the week before
    ])
    def test_week_start_monday(self, frozen_now, today, expected):
        frozen_now(today)
        assert get_curr_week_start("UTC", "monday") == pd.Timestamp(expected)

    @pytest.mark.parametrize("today,expected", [
        ("2027-03-10", "2027-03-07"),  # Wednesday -> the Sunday before
        ("2027-03-07", "2027-03-07"),  # Sunday is its own week start
        ("2027-03-13", "2027-03-07"),  # Saturday closes that same week
    ])
    def test_week_start_sunday(self, frozen_now, today, expected):
        frozen_now(today)
        assert get_curr_week_start("UTC", "sunday") == pd.Timestamp(expected)

    def test_week_start_defaults_to_monday(self, frozen_now):
        frozen_now("2027-03-10")
        assert get_curr_week_start("UTC") == get_curr_week_start(
            "UTC", "monday")

    def test_week_start_crosses_a_month_boundary(self, frozen_now):
        # Thursday 1 April 2027; its week began in March
        frozen_now("2027-04-01")
        assert get_curr_week_start("UTC", "monday") == pd.Timestamp(
            "2027-03-29")

    def test_month_start(self, frozen_now):
        frozen_now("2027-03-31 23:59:59")
        assert get_curr_month_start("UTC") == pd.Timestamp("2027-03-01")

    def test_year_start(self, frozen_now):
        frozen_now("2027-12-31 23:59:59")
        assert get_curr_year_start("UTC") == pd.Timestamp("2027-01-01")

    def test_year_start_on_new_years_day(self, frozen_now):
        frozen_now("2027-01-01 00:00:01")
        assert get_curr_year_start("UTC") == pd.Timestamp("2027-01-01")


class TestFormatDateLabel:
    def test_strips_the_zero_padding_after_a_space(self):
        date = pd.Timestamp("2027-07-06")
        assert format_date_label(date, "%A, %b %d") == "Tuesday, Jul 6"

    def test_leaves_an_unpadded_day_alone(self):
        date = pd.Timestamp("2027-07-16")
        assert format_date_label(date, "%A, %b %d") == "Friday, Jul 16"

    def test_formats_a_month_label(self):
        assert format_date_label(pd.Timestamp("2027-03-01"), "%B %Y") == \
            "March 2027"

    def test_formats_a_year_label(self):
        assert format_date_label(pd.Timestamp("2027-03-01"), "%Y") == "2027"

    def test_does_not_eat_a_significant_zero(self):
        # The implementation removes the zero from every " 0" in the output,
        # not just the day field. A 2000s year or a 10-minute past the hour
        # time would be corrupted if a format ever put one after a space.
        assert format_date_label(pd.Timestamp("2027-07-06"), "%b %d") == "Jul 6"
        # No space precedes the zero here, so it survives
        assert format_date_label(
            pd.Timestamp("2027-07-06 09:05"), "%I:%M %p") == "09:05 AM"
