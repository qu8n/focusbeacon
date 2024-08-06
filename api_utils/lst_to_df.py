
import pandas as pd
from api_utils.time import fm_time_str_to_local_dt


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

    df = pd.DataFrame(rows)
    if not df.empty:
        df['session_id'] = df['session_id'].astype(str)
        df['duration'] = df['duration'].astype(int)
        df['completed'] = df['completed'].astype(bool)
        df['session_title'] = df['session_title'].astype(str)
        df['partner_id'] = df['partner_id'].astype(str)

        # Times are saved in the local time without timezone info
        # (e.g. 2pm EST is simply saved as 2pm)
        # This enables more simple operations and comparisons
        df['start_time'] = df['start_time'].dt.tz_localize(None)
        df['requested_at'] = df['requested_at'].dt.tz_localize(None)
        df['joined_at'] = df['joined_at'].dt.tz_localize(None)

    return df
