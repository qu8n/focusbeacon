
from typing import Annotated
from api.helpers.metric import calculate_max_daily_streak, \
    calculate_curr_streak, prepare_heatmap_data, \
    prepare_sessions_chart_data_by_duration
from api.helpers.time import get_end_of_week, get_start_of_week, local_dt_to_utc_dt, \
    ms_to_minutes, minutes_to_ms, ms_to_hours, get_start_of_prev_week
from api.helpers.request import get_session_id, \
    get_access_token
from api.helpers.focusmate import fetch_focusmate_profile, \
    fetch_focusmate_sessions, fm_raw_sessions_to_df, get_data
import os
from fastapi import Depends, FastAPI, Request
from dotenv import load_dotenv
from cachetools import TTLCache
import ssl
ssl._create_default_https_context = ssl._create_stdlib_context


app = FastAPI()
load_dotenv()
cache = TTLCache(maxsize=100, ttl=60)


fm_api_profile_endpoint = os.getenv("NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT")
fm_api_sessions_endpoint = os.getenv("NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT")


@app.get("/api/py/profile")
async def profile(request: Request):
    session_id = get_session_id(request)
    access_token = get_access_token(session_id)
    profile_data = fetch_focusmate_profile(
        fm_api_profile_endpoint, access_token).get("user")
    return {"data": profile_data}


@app.get("/api/py/sessions")
async def sessions(request: Request):
    session_id = get_session_id(request)
    access_token = get_access_token(session_id)

    profile_data = fetch_focusmate_profile(
        fm_api_profile_endpoint, access_token).get("user")
    local_timezone: str = profile_data.get("timeZone")

    start_of_week = get_start_of_week(local_timezone)
    start_of_week_utc_dt = local_dt_to_utc_dt(
        start_of_week, local_timezone)

    sessions_data: list = fetch_focusmate_sessions(
        fm_api_sessions_endpoint, access_token,
        start_of_week_utc_dt, get_today_utc()).get("sessions")

    all_sessions = fm_raw_sessions_to_df(sessions_data, local_timezone)
    sessions = all_sessions[all_sessions['completed'] == True].copy()

    total_sessions = len(sessions)
    total_session_minutes = ms_to_minutes(sessions['duration'].sum())

    total_partners = len(sessions['partner_id'].unique())
    partner_session_counts = sessions['partner_id'].value_counts()
    total_repeat_partners = len(
        partner_session_counts[partner_session_counts > 1])

    earliest_session_time = sessions['start_time'].dt.time.min()
    latest_session_time = sessions['start_time'].dt.time.max()
    most_common_session_time = sessions['start_time'].dt.time.mode(
    ).iloc[0]

    total_duration_by_date = sessions.groupby(
        sessions['start_time'].dt.date)['duration'].sum()
    daily_avg_minutes = ms_to_minutes(total_duration_by_date.mean())
    daily_median_minutes = ms_to_minutes(total_duration_by_date.median())
    daily_record_minutes = ms_to_minutes(total_duration_by_date.max())

    sessions['joined_late_in_seconds'] = (
        sessions['joined_at'] - sessions['start_time']).dt.total_seconds()
    avg_joined_late_in_seconds = sessions['joined_late_in_seconds'].mean()
    median_joined_late_in_seconds = sessions['joined_late_in_seconds'].median()
    late_sessions = len(sessions[sessions['joined_late_in_seconds'] > 120])
    on_time_sessions = len(sessions[sessions['joined_late_in_seconds'] <= 120])

    total_25_minute_sessions = len(
        sessions[sessions['duration'] == minutes_to_ms(25)])
    total_50_minute_sessions = len(
        sessions[sessions['duration'] == minutes_to_ms(50)])
    total_75_minute_sessions = len(
        sessions[sessions['duration'] == minutes_to_ms(75)])

    return {
        "total_metrics": {
            "total_sessions": total_sessions,
            "total_session_minutes": total_session_minutes,
            "total_partners": total_partners,
            "total_repeat_partners": total_repeat_partners
        },
        "time_metrics": {
            "earliest_session_time": earliest_session_time,
            "latest_session_time": latest_session_time,
            "most_common_session_time": most_common_session_time
        },
        "daily_metrics": {
            "daily_avg_minutes": daily_avg_minutes,
            "daily_median_minutes": daily_median_minutes,
            "daily_record_minutes": daily_record_minutes
        },
        "timeliness_metrics": {
            "avg_joined_late_in_seconds": avg_joined_late_in_seconds,
            "median_joined_late_in_seconds": median_joined_late_in_seconds,
            "late_sessions": late_sessions,
            "on_time_sessions": on_time_sessions
        },
        "sessions_by_duration": {
            "total_25_minute_sessions": total_25_minute_sessions,
            "total_50_minute_sessions": total_50_minute_sessions,
            "total_75_minute_sessions": total_75_minute_sessions
        }
        # "df": sessions_df.to_dict(orient='records')
    }


SessionIdDep = Annotated[str, Depends(get_session_id)]


@app.get("/api/py/streak")
async def streak(session_id: SessionIdDep):
    profile, sessions = await get_data(session_id, cache)
    local_timezone: str = profile.get("timeZone")
    return {
        "daily_streak": calculate_curr_streak(sessions, "D", local_timezone),
        "weekly_streak": calculate_curr_streak(sessions, "W", local_timezone),
        "monthly_streak": calculate_curr_streak(sessions, "M", local_timezone),
        "max_daily_streak": calculate_max_daily_streak(sessions),
        "heatmap_data": prepare_heatmap_data(sessions)
    }


@app.get("/api/py/weekly")
async def weekly(session_id: SessionIdDep):
    profile, sessions = await get_data(session_id, cache)

    local_timezone: str = profile.get("timeZone")

    start_of_week = get_start_of_week(local_timezone)
    start_of_prev_week = get_start_of_prev_week(local_timezone)
    end_of_week = get_end_of_week(start_of_week)

    curr_week_sessions = sessions[sessions['start_time'] >= start_of_week]
    prev_week_sessions = sessions[
        (sessions['start_time'] >= start_of_prev_week) &
        (sessions['start_time'] < start_of_week)
    ]

    partner_session_counts = curr_week_sessions['partner_id'].value_counts()
    total_repeat_partners = len(
        partner_session_counts[partner_session_counts > 1])

    return {
        "total": {
            "sessions": len(curr_week_sessions),
            "hours": ms_to_hours(curr_week_sessions['duration'].sum()),
            "partners": len(curr_week_sessions['partner_id'].unique()),
            "repeat_partners": total_repeat_partners
        },
        "prev_period_delta": {
            "sessions": len(curr_week_sessions) - len(prev_week_sessions),
            "hours": ms_to_hours(curr_week_sessions['duration'].sum() -
                                 prev_week_sessions['duration'].sum())
        },
        "chart": {
            "sessions": prepare_sessions_chart_data_by_duration(
                curr_week_sessions, start_of_week, end_of_week)
        }
    }
