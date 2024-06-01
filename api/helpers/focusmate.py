
from datetime import datetime
import pandas as pd
import json
import http.client
from api.helpers.time import dt_to_fm_time_str, fm_time_str_to_local_dt
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

fm_api_url = os.getenv("NEXT_PUBLIC_FM_API_URL")
fm_api_domain = urlparse(fm_api_url).netloc


def fm_sessions_data_to_df(sessions_data: list, local_timezone: str):
    rows = []

    for session in sessions_data:
        session_id = session['sessionId']
        duration = session['duration']
        start_time = session['startTime']

        user = session['users'][0]
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

    df['session_id'] = df['session_id'].astype(str)
    df['duration'] = df['duration'].astype(int)
    df['start_time'] = df['start_time'].dt.tz_localize(None)
    df['requested_at'] = df['requested_at'].dt.tz_localize(None)
    df['joined_at'] = df['joined_at'].dt.tz_localize(None)
    df['completed'] = df['completed'].astype(bool)
    df['session_title'] = df['session_title'].astype(str)
    df['partner_id'] = df['partner_id'].astype(str)

    return df


def fetch_focusmate_sessions(endpoint: str, access_token: str,
                             start_utc_dt: datetime, end_utc_dt: datetime):
    conn = http.client.HTTPSConnection(fm_api_domain)

    headers = {'Authorization': 'Bearer ' + access_token}

    endpoint += "?"

    query_params = {
        "start": dt_to_fm_time_str(start_utc_dt),
        "end": dt_to_fm_time_str(end_utc_dt)
    }

    for key, value in query_params.items():
        endpoint += f"{key}={value}&"

    endpoint = endpoint[:-1]

    conn.request("GET", endpoint, headers=headers)
    response = conn.getresponse()
    data_as_str = response.read().decode("utf-8")
    data_as_obj = json.loads(data_as_str)

    conn.close()

    return data_as_obj


def fetch_focusmate_profile(endpoint: str, access_token: str):
    conn = http.client.HTTPSConnection(fm_api_domain)

    headers = {'Authorization': 'Bearer ' + access_token}

    conn.request("GET", endpoint, headers=headers)

    response = conn.getresponse()
    data_as_str = response.read().decode("utf-8")
    data_as_obj = json.loads(data_as_str)

    conn.close()

    return data_as_obj
