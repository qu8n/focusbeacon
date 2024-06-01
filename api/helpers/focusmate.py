
import pandas as pd
import json
import http.client
from api.helpers.cryptography import decrypt
from api.helpers.time import utc_str_to_local_datetime
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

        local_start_time = utc_str_to_local_datetime(
            start_time, local_timezone)
        local_requested_at = utc_str_to_local_datetime(
            requested_at, local_timezone)
        local_joined_at = utc_str_to_local_datetime(joined_at, local_timezone)

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


def fetch_focusmate_data(endpoint: str, access_token: str, query_params={}):
    conn = http.client.HTTPSConnection(fm_api_domain)

    headers = {'Authorization': 'Bearer ' + access_token}
    if query_params != {}:
        endpoint += "?"
        for key, value in query_params.items():
            endpoint += f"{key}={value}&"
        endpoint = endpoint[:-1]

    conn.request("GET", endpoint, headers=headers)
    response = conn.getresponse()
    data_as_str = response.read().decode("utf-8")
    data_as_obj = json.loads(data_as_str)

    conn.close()

    return data_as_obj
