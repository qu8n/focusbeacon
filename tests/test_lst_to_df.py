"""The seam where Focusmate's JSON becomes the frame every metric reads.

Most of what can go wrong downstream starts here: a wrong dtype, a null that
turns into a string, or a timezone that never gets stripped.
"""

import pandas as pd

from api_utils.lst_to_df import SESSION_COLUMNS, sessions_ls_to_df
from tests.conftest import raw_session

TZ = "America/New_York"


class TestEmptyInput:
    def test_returns_named_columns_with_no_rows(self):
        frame = sessions_ls_to_df([], TZ)
        assert frame.empty
        assert list(frame.columns) == SESSION_COLUMNS

    def test_can_be_filtered_on_completed_without_a_key_error(self):
        # A brand-new account reaches every endpoint through this path, and
        # each one filters on `completed` before checking for emptiness
        frame = sessions_ls_to_df([], TZ)
        assert frame[frame["completed"] == True].empty  # noqa: E712


class TestFieldMapping:
    def test_maps_every_column(self):
        frame = sessions_ls_to_df([raw_session()], TZ)
        row = frame.iloc[0]
        assert row["session_id"] == "fm-session-1"
        assert row["duration"] == 1500000
        assert row["completed"] is True or row["completed"] == True  # noqa: E712
        assert row["session_title"] == "Focus"
        assert row["partner_id"] == "partner-1"

    def test_converts_times_to_naive_local(self):
        # 14:00Z on 1 March is 09:00 in New York, and the frame stores the
        # local wall clock with no tzinfo attached
        frame = sessions_ls_to_df([raw_session()], TZ)
        start = frame.iloc[0]["start_time"]
        assert start == pd.Timestamp("2027-03-01 09:00:00")
        assert start.tzinfo is None

    def test_respects_daylight_saving_in_the_target_zone(self):
        frame = sessions_ls_to_df(
            [raw_session(start_time="2027-07-01T14:00:00Z")], TZ)
        # EDT is UTC-4, so the same 14:00Z lands an hour later than in March
        assert frame.iloc[0]["start_time"] == pd.Timestamp("2027-07-01 10:00")

    def test_handles_a_timezone_ahead_of_utc(self):
        frame = sessions_ls_to_df([raw_session()], "Asia/Tokyo")
        assert frame.iloc[0]["start_time"] == pd.Timestamp("2027-03-01 23:00")


class TestDtypes:
    def test_uses_the_dtypes_the_metrics_rely_on(self):
        frame = sessions_ls_to_df([raw_session()], TZ)
        assert frame["duration"].dtype == "int64"
        assert frame["completed"].dtype == "bool"
        assert frame["partner_id"].dtype == "string"
        assert pd.api.types.is_datetime64_any_dtype(frame["start_time"])

    def test_partner_id_uses_the_nullable_string_dtype(self):
        # Not object/str: astype(str) would render a missing partner as the
        # literal "None", and every unmatched session would then look like the
        # same partner -- inflating both the partner total and the repeat count
        frame = sessions_ls_to_df([
            raw_session(session_id="a", partner_id=None),
            raw_session(session_id="b", partner_id=None),
        ], TZ)
        assert frame["partner_id"].isna().all()
        assert frame["partner_id"].nunique() == 0
        assert not (frame["partner_id"] == "None").any()


class TestIncompleteSessions:
    def test_missing_partner_becomes_null(self):
        frame = sessions_ls_to_df([raw_session(partner_id=None)], TZ)
        assert pd.isna(frame.iloc[0]["partner_id"])

    def test_missing_joined_at_becomes_nat(self):
        frame = sessions_ls_to_df([
            raw_session(session_id="joined"),
            raw_session(session_id="not-joined", joined_at=None),
        ], TZ)
        assert pd.isna(frame.iloc[1]["joined_at"])

    def test_parses_a_batch_where_nobody_joined_anything(self):
        # Every joinedAt null makes that column object dtype rather than
        # datetime64, and .dt does not exist there. Two ordinary accounts land
        # in this state: someone who booked and no-showed every time, and a
        # brand-new user whose first session has not happened yet. Both used
        # to get an AttributeError out of the parser, which reached them as a
        # 500 on every dashboard route.
        frame = sessions_ls_to_df([
            raw_session(session_id="a", joined_at=None, completed=False,
                        partner_id=None),
            raw_session(session_id="b", joined_at=None, completed=False,
                        partner_id=None),
        ], TZ)
        assert len(frame) == 2
        assert frame["joined_at"].isna().all()
        assert pd.api.types.is_datetime64_any_dtype(frame["joined_at"])

    def test_parses_a_single_upcoming_session(self):
        # The sessions endpoint returns future bookings too, so this is what
        # the very first sync after sign-up can look like
        frame = sessions_ls_to_df([
            raw_session(joined_at=None, completed=False, partner_id=None),
        ], TZ)
        assert len(frame) == 1
        assert pd.isna(frame.iloc[0]["joined_at"])

    def test_keeps_an_uncompleted_session_in_the_frame(self):
        # The history table shows no-shows, so they are filtered out per
        # endpoint rather than dropped at parse time
        frame = sessions_ls_to_df([
            raw_session(session_id="a", completed=True),
            raw_session(session_id="b", completed=False, joined_at=None,
                        partner_id=None),
        ], TZ)
        assert len(frame) == 2
        assert frame["completed"].tolist() == [True, False]

    def test_absent_completed_flag_reads_as_false(self):
        session = raw_session()
        del session["users"][0]["completed"]
        frame = sessions_ls_to_df([session], TZ)
        assert bool(frame.iloc[0]["completed"]) is False

    def test_null_title_survives_as_a_placeholder(self):
        # astype(str) turns None into "None" here; calc_history_data is what
        # rewrites that to "N/A" for display
        frame = sessions_ls_to_df([raw_session(title=None)], TZ)
        assert frame.iloc[0]["session_title"] == "None"


class TestMultipleSessions:
    def test_preserves_input_order(self):
        frame = sessions_ls_to_df([
            raw_session(session_id="first", start_time="2027-03-01T14:00:00Z"),
            raw_session(session_id="second", start_time="2027-02-01T14:00:00Z"),
        ], TZ)
        assert frame["session_id"].tolist() == ["first", "second"]

    def test_coerces_a_numeric_session_id_to_string(self):
        frame = sessions_ls_to_df([raw_session(session_id=12345)], TZ)
        assert frame.iloc[0]["session_id"] == "12345"
