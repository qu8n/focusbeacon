
from datetime import datetime, timezone
from cachetools import TTLCache
from cachetools.keys import hashkey
import pandas as pd
import json
import http.client
from api_helpers.request import get_access_token
from api_helpers.time import dt_to_fm_time_str, fm_time_str_to_local_dt
import os
from urllib.parse import urlparse
from dotenv import load_dotenv
import aiohttp
import certifi
import asyncio
import ssl
ssl_context = ssl.create_default_context(cafile=certifi.where())

load_dotenv()

fm_api_profile_endpoint = os.getenv("NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT")
fm_api_sessions_endpoint = os.getenv("NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT")
fm_api_url = os.getenv("NEXT_PUBLIC_FM_API_URL")
fm_api_domain = urlparse(fm_api_url).netloc


def sessions_ls_to_df(fm_raw_sessions: list, local_timezone: str):
    rows = []

    for session in fm_raw_sessions:
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
    df['completed'] = df['completed'].astype(bool)
    df['session_title'] = df['session_title'].astype(str)
    df['partner_id'] = df['partner_id'].astype(str)

    df['start_time'] = df['start_time'].dt.tz_localize(None)
    df['requested_at'] = df['requested_at'].dt.tz_localize(None)
    df['joined_at'] = df['joined_at'].dt.tz_localize(None)

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


async def fetch_focusmate_sessions_by_year(
        session: aiohttp.ClientSession, url: str, headers: dict[str, str]):
    async with session.get(url, headers=headers) as response:
        data = await response.json()
        return data.get("sessions", [])


async def fetch_all_focusmate_sessions(
        endpoint: str, access_token: str, member_since: str):
    headers = {'Authorization': 'Bearer ' + access_token}

    curr_year = datetime.now(timezone.utc).year
    first_year = int(member_since[:4])

    conn = aiohttp.TCPConnector(ssl=ssl_context)
    aiohttpSession = aiohttp.ClientSession(connector=conn)

    async with aiohttpSession as session:
        tasks = []

        # Split the request into yearly chunks per the API's rules
        for year in range(first_year, curr_year + 1):
            api_endpoint_with_year = f"{fm_api_url}{endpoint}?start={
                year}-01-01T00:00:00Z&end={year}-12-31T23:59:59Z"

            tasks.append(fetch_focusmate_sessions_by_year(
                session, api_endpoint_with_year, headers))

        sessions = await asyncio.gather(*tasks)

    combined_sessions = []
    for session in sessions:
        combined_sessions.extend(session)

    return combined_sessions


def fetch_focusmate_profile(endpoint: str, access_token: str):
    conn = http.client.HTTPSConnection(fm_api_domain)

    headers = {'Authorization': 'Bearer ' + access_token}

    conn.request("GET", endpoint, headers=headers)

    response = conn.getresponse()
    data_as_str = response.read().decode("utf-8")
    data_as_obj: dict = json.loads(data_as_str)

    conn.close()

    return data_as_obj


async def get_data(session_id: str, cache: TTLCache):
    cached_profile: dict = cache.get(
        hashkey('profile', session_id))
    cached_sessions: pd.DataFrame = cache.get(
        hashkey('sessions', session_id))
    if (cached_profile is not None) and (cached_sessions is not None):
        return cached_profile, cached_sessions

    access_token = get_access_token(session_id)

    profile: dict = fetch_focusmate_profile(
        fm_api_profile_endpoint, access_token).get("user")
    local_timezone: str = profile.get("timeZone")
    member_since: str = profile.get("memberSince")

    sessions = await fetch_all_focusmate_sessions(
        fm_api_sessions_endpoint, access_token, member_since)
    sessions = sessions_ls_to_df(sessions, local_timezone)

    cache[hashkey('profile', session_id)] = profile
    cache[hashkey('sessions', session_id)] = sessions

    return profile, sessions
