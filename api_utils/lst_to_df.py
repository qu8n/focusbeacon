
import pandas as pd
from api_utils.time import fm_time_str_to_local_dt

SESSION_COLUMNS = ['session_id', 'duration', 'start_time', 'requested_at',
                   'joined_at', 'completed', 'session_title', 'partner_id']


def _to_naive_local(column: pd.Series) -> pd.Series:
    """Drop the timezone, keeping the local wall clock.

    The conversion has to come first. When every value in the column is null
    -- someone who booked and no-showed every time, or a new user whose first
    session has not happened yet -- the DataFrame constructor infers object
    dtype, and `.dt` does not exist there. That reached the user as a 500 on
    every dashboard route.
    """
    converted = pd.to_datetime(column)
    if isinstance(converted.dtype, pd.DatetimeTZDtype):
        return converted.dt.tz_localize(None)
    return converted


def sessions_ls_to_df(fm_raw_sessions: list, local_timezone: str):
    rows = []

    for session in fm_raw_sessions:
        session_id = session['sessionId']
        duration = session['duration']
        start_time = session['startTime']

        user: dict = session['users'][0]
        session_title = user.get('sessionTitle')
        requested_at = user.get('requestedAt')
        joined_at = user.get('joinedAt')
        completed = user.get('completed')

        partner_id = session['users'][1].get(
            'userId') if len(session['users']) > 1 else None

        local_start_time = fm_time_str_to_local_dt(
            start_time, local_timezone)
        local_requested_at = fm_time_str_to_local_dt(
            requested_at, local_timezone)
        local_joined_at = fm_time_str_to_local_dt(
            joined_at, local_timezone)

        row = {
            'session_id': session_id,
            'duration': duration,
            'start_time': local_start_time,
            'requested_at': local_requested_at,
            'joined_at': local_joined_at,
            'completed': completed,
            'session_title': session_title,
            'partner_id': partner_id
        }

        rows.append(row)

    # Named columns even when there are no rows, so callers can filter on
    # `completed` without a KeyError on a brand-new account
    df = pd.DataFrame(rows, columns=SESSION_COLUMNS)
    if not df.empty:
        df['session_id'] = df['session_id'].astype(str)
        df['duration'] = df['duration'].astype(int)
        df['completed'] = df['completed'].astype(bool)
        df['session_title'] = df['session_title'].astype(str)
        # Not .astype(str): that turns an unmatched session's None into the
        # string "None", and every such session then looks like the same
        # partner -- inflating both the partner total and the repeat count
        df['partner_id'] = df['partner_id'].astype('string')

        # Times are saved in the local time without timezone info
        # (e.g. 2pm EST is simply saved as 2pm)
        # This enables more simple operations and comparisons
        df['start_time'] = _to_naive_local(df['start_time'])
        df['requested_at'] = _to_naive_local(df['requested_at'])
        df['joined_at'] = _to_naive_local(df['joined_at'])

    return df
