
from datetime import datetime, timezone
import json
import http.client
from cachetools import TTLCache
from cachetools.keys import hashkey
import pandas as pd
from api_utils.config import \
    FM_API_PROFILE_ENDPOINT, FM_API_SESSIONS_ENDPOINT, FM_API_URL
from urllib.parse import urlparse
import aiohttp
import certifi
import asyncio
import ssl
from api_utils.faker import get_fake_data
from api_utils.lst_to_df import sessions_ls_to_df
from api_utils.request import get_access_token

ssl_context = ssl.create_default_context(cafile=certifi.where())
fm_api_domain = urlparse(FM_API_URL).netloc


def fetch_focusmate_profile(access_token: str):
    conn = http.client.HTTPSConnection(fm_api_domain)
    headers = {'Authorization': 'Bearer ' + access_token}

    conn.request("GET", FM_API_PROFILE_ENDPOINT, headers=headers)
    response = conn.getresponse()
    data_as_str = response.read().decode("utf-8")
    data_as_obj: dict = json.loads(data_as_str)
    conn.close()

    return data_as_obj


async def fetch_focusmate_sessions(access_token: str, member_since: str):
    headers = {'Authorization': 'Bearer ' + access_token}

    curr_year = datetime.now(timezone.utc).year
    first_year = int(member_since[:4])

    conn = aiohttp.TCPConnector(ssl=ssl_context)
    aiohttpSession = aiohttp.ClientSession(connector=conn)

    async with aiohttpSession as session:
        tasks = []

        # Split the request into yearly chunks per the API's rules
        for year in range(first_year, curr_year + 1):
            api_endpoint_with_year = f"{FM_API_URL}{FM_API_SESSIONS_ENDPOINT}?start={
                year}-01-01T00:00:00Z&end={year}-12-31T23:59:59Z"

            tasks.append(fetch_focusmate_sessions_by_year(
                session, api_endpoint_with_year, headers))

        sessions = await asyncio.gather(*tasks)

    combined_sessions = []
    for session in sessions:
        combined_sessions.extend(session)

    return combined_sessions


async def fetch_focusmate_sessions_by_year(
        session: aiohttp.ClientSession, url: str, headers: dict[str, str]):
    async with session.get(url, headers=headers) as response:
        data = await response.json()
        return data.get("sessions", [])


async def get_data(
        session_id: str,
        user_data_cache: TTLCache,
        demo_data_cache: TTLCache,
        demo: bool = False):
    if demo:
        return get_fake_data(demo_data_cache)

    cached_profile: dict = user_data_cache.get(
        hashkey('profile', session_id))
    cached_sessions: pd.DataFrame = user_data_cache.get(
        hashkey('sessions', session_id))
    if (cached_profile is not None) and (cached_sessions is not None):
        return cached_profile, cached_sessions

    access_token = get_access_token(session_id)

    profile: dict = fetch_focusmate_profile(access_token).get("user")
    local_timezone: str = profile.get("timeZone")
    member_since: str = profile.get("memberSince")

    sessions = await fetch_focusmate_sessions(access_token, member_since)
    sessions = sessions_ls_to_df(sessions, local_timezone)

    user_data_cache[hashkey('profile', session_id)] = profile
    user_data_cache[hashkey('sessions', session_id)] = sessions

    return profile, sessions
