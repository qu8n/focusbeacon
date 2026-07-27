
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
from api_utils.lst_to_df import sessions_ls_to_df
from api_utils.request import get_access_token, SessionNotFound

ssl_context = ssl.create_default_context(cafile=certifi.where())
fm_api_domain = urlparse(FM_API_URL).netloc

# http.client defaults to no timeout at all, so a hung Focusmate connection
# would occupy the request until the platform killed the whole function
FM_REQUEST_TIMEOUT_S = 15


def fetch_focusmate_profile(access_token: str):
    # The context has to be passed explicitly: without it HTTPSConnection falls
    # back to the process-wide default, and this request carries a bearer token
    conn = http.client.HTTPSConnection(
        fm_api_domain, context=ssl_context, timeout=FM_REQUEST_TIMEOUT_S)
    headers = {'Authorization': 'Bearer ' + access_token}

    try:
        conn.request("GET", FM_API_PROFILE_ENDPOINT, headers=headers)
        response = conn.getresponse()
        data_as_str = response.read().decode("utf-8")
        if response.status in (401, 403):
            # Focusmate has stopped honoring this token -- typically the user
            # revoked our access on their side. Our own session row is still
            # intact, so nothing else notices; without this the user keeps
            # passing the sign-in check while every dashboard call 500s behind
            # a loading skeleton. Signing in again mints a working token.
            raise SessionNotFound(
                f"Focusmate rejected the stored access token "
                f"({response.status})")
        if response.status >= 400:
            raise RuntimeError(
                f"Focusmate profile request failed with {response.status}")
    finally:
        conn.close()

    data_as_obj: dict = json.loads(data_as_str)

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
        # Defaulting to [] on a failed year would silently rewrite that year as
        # "no sessions" -- the dashboard would show confidently wrong totals and
        # cache them, rather than surfacing the failed dependency
        response.raise_for_status()
        data = await response.json()
        sessions = data.get("sessions")
        if sessions is None:
            raise RuntimeError(
                f"Focusmate sessions response had no 'sessions' key: {url}")
        return sessions


async def get_data(session_id: str, user_data_cache: TTLCache):
    # Re-check the session against the database on every request, ahead of the
    # cache. Serving the cache first would keep a session that /api/sign-out
    # just revoked working until the TTL lapsed, which makes signing out only
    # as immediate as the next cache miss. This is one indexed lookup guarding
    # the far more expensive Focusmate fetches below.
    #
    # It is a blocking client, so it goes to a thread rather than stalling the
    # event loop for every other request on this instance.
    #
    # Only SessionNotFound means "your session is invalid". Because this now
    # runs on every request rather than only on a cache miss, swallowing
    # Supabase or network errors here too would sign every active user out
    # during a brief outage -- so those propagate and surface as a 5xx.
    try:
        access_token = await asyncio.to_thread(get_access_token, session_id)
    except SessionNotFound as e:
        print(f"Rejecting unknown session: {e}")
        return None, None

    cached_profile: dict = user_data_cache.get(
        hashkey('profile', session_id))
    cached_sessions: pd.DataFrame = user_data_cache.get(
        hashkey('sessions', session_id))
    if (cached_profile is not None) and (cached_sessions is not None):
        return cached_profile, cached_sessions

    # Blocking http.client call, so it goes to a thread for the same reason
    # get_access_token does
    try:
        profile_payload = await asyncio.to_thread(
            fetch_focusmate_profile, access_token)
    except SessionNotFound as e:
        print(f"Rejecting session Focusmate no longer honors: {e}")
        return None, None

    profile: dict = profile_payload.get("user")
    if not profile:
        raise RuntimeError("Focusmate profile response had no 'user' key")
    local_timezone: str = profile.get("timeZone")
    member_since: str = profile.get("memberSince")

    sessions = await fetch_focusmate_sessions(access_token, member_since)
    sessions = sessions_ls_to_df(sessions, local_timezone)

    user_data_cache[hashkey('profile', session_id)] = profile
    user_data_cache[hashkey('sessions', session_id)] = sessions

    return profile, sessions
