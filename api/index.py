from urllib.parse import urlparse
from datetime import datetime, timedelta, timezone
from dateutil import tz, parser
from fastapi import FastAPI, Request
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import base64
import http.client
import json
import pandas as pd


app = FastAPI()
load_dotenv()  # from .env file

supabase_project_url = os.getenv("SUPABASE_PROJECT_URL")
supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_client: Client = create_client(
    supabase_project_url, supabase_service_role_key)

# Configuration for AES encryption
algorithm = algorithms.AES
key_as_string = os.getenv("ENCRYPTION_KEY")
key_as_bytes = bytes.fromhex(key_as_string)
aes_iv = os.getenv("ENCRYPTION_AES_IV")
backend = default_backend()


def encrypt(text: str) -> str:
    iv = bytes.fromhex(aes_iv)

    cipher = Cipher(algorithm(key_as_bytes), modes.CBC(iv), backend=backend)
    encryptor = cipher.encryptor()

    padder = padding.PKCS7(algorithm.block_size).padder()
    padded_data = padder.update(text.encode('utf-8')) + padder.finalize()

    encrypted = encryptor.update(padded_data) + encryptor.finalize()

    return f"{base64.b64encode(iv).decode('utf-8')}:{base64.b64encode(encrypted).decode('utf-8')}"


def decrypt(encrypted_text: str) -> str:
    iv_text, encrypted = encrypted_text.split(":")
    iv = base64.b64decode(iv_text)
    encrypted_data = base64.b64decode(encrypted)

    cipher = Cipher(algorithm(key_as_bytes), modes.CBC(iv), backend=backend)
    decryptor = cipher.decryptor()

    decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()

    unpadder = padding.PKCS7(algorithm.block_size).unpadder()
    decrypted = unpadder.update(decrypted_padded) + unpadder.finalize()

    return decrypted.decode('utf-8')


def get_session_id_from_cookie(request: Request):
    cookies = request.cookies
    cookie_name = os.getenv("NEXT_PUBLIC_SESSION_COOKIE_NAME")
    session_id = cookies.get(cookie_name)
    return session_id


def get_access_token_from_db(session_id: str):
    response = supabase_client.table('profile').select(
        "access_token_encrypted").eq('session_id', session_id).execute()
    access_token_encrypted = response.data[0]['access_token_encrypted']
    access_token = decrypt(access_token_encrypted)
    return access_token


fm_api_url = os.getenv("NEXT_PUBLIC_FM_API_URL")
fm_api_profile_endpoint = os.getenv("NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT")
fm_api_sessions_endpoint = os.getenv("NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT")
fm_api_domain = urlparse(fm_api_url).netloc


@app.get("/api/py/profile")
async def profile(request: Request):
    session_id = get_session_id_from_cookie(request)
    access_token = get_access_token_from_db(session_id)
    profile_data = fetch_focusmate_data(
        fm_api_profile_endpoint, access_token).get("user")
    return {"data": profile_data}


@app.get("/api/py/sessions")
async def sessions(request: Request):
    session_id = get_session_id_from_cookie(request)
    access_token = get_access_token_from_db(session_id)

    profile_data = fetch_focusmate_data(
        fm_api_profile_endpoint, access_token)

    local_timezone: str = profile_data.get("user").get("timeZone")

    start_of_week = get_start_of_week_local_datetime(local_timezone)
    start_of_week_utc = local_datetime_to_utc_datetime(
        start_of_week, local_timezone)
    start_of_week_query_str = datetime_to_query_str(start_of_week_utc)

    now_utc = datetime.now(timezone.utc)
    now_utc_query_str = datetime_to_query_str(now_utc)

    query_params = {
        "start": start_of_week_query_str,
        "end": now_utc_query_str
    }

    sessions_data: list = fetch_focusmate_data(
        fm_api_sessions_endpoint, access_token, query_params).get("sessions")

    sessions_df = fm_sessions_data_to_df(sessions_data, local_timezone)

    completed_sessions = sessions_df[sessions_df['completed'] == True]

    total_sessions = len(completed_sessions)

    total_duration = int(completed_sessions['duration'].sum())  # in ms
    total_minutes = int(total_duration / 60000)
    total_hours = int(total_minutes / 60)

    total_unique_partners = len(completed_sessions['partner_id'].unique())
    total_repeat_partners = total_sessions - total_unique_partners

    earliest_session_time = sessions_df['start_time'].dt.time.min()
    latest_session_time = sessions_df['start_time'].dt.time.max()
    most_common_session_time = sessions_df['start_time'].dt.time.mode().iloc[0]

    daily_avg_duration = completed_sessions.groupby(
        completed_sessions['start_time'].dt.date)['duration'].sum().mean()
    daily_avg_minutes = int(daily_avg_duration / 60000)

    sessions_df['join_diff'] = sessions_df['start_time'] - \
        sessions_df['joined_at']
    avg_join_sec_diff = int(sessions_df['join_diff'].mean().total_seconds())

    return {
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "total_hours": total_hours,
        "total_unique_partners": total_unique_partners,
        "total_repeat_partners": total_repeat_partners,
        "earliest_session_time": earliest_session_time,
        "latest_session_time": latest_session_time,
        "most_common_session_time": most_common_session_time,
        "daily_avg_minutes": daily_avg_minutes,
        "avg_join_sec_diff": avg_join_sec_diff
        # "df": sessions_df.to_dict(orient='records')
    }


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


def utc_str_to_local_datetime(utc_time: str, local_timezone: str):
    utc_as_datetime = parser.parse(utc_time)
    local_timezone_obj = tz.gettz(local_timezone)
    local_time = utc_as_datetime.replace(
        tzinfo=tz.tzutc()).astimezone(local_timezone_obj)
    return local_time


def local_datetime_to_utc_datetime(local_time: datetime, local_timezone: str):
    local_timezone_obj = tz.gettz(local_timezone)
    utc_time = local_time.replace(
        tzinfo=local_timezone_obj).astimezone(tz.tzutc())
    return utc_time


def datetime_to_query_str(datetime_obj: datetime):
    return datetime_obj.strftime('%Y-%m-%dT%H:%M:%SZ')


def get_start_of_week_local_datetime(local_timezone: str):
    '''Returns the start of the current week in the given timezone, defined as
    00:00:00 on Monday of the current week.'''
    today_local = datetime.now(tz.gettz(local_timezone))
    monday = today_local - timedelta(days=today_local.weekday())
    start_of_week = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    return start_of_week
