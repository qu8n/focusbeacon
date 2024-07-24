
from typing import Annotated
import pandas as pd
import datetime
from pydantic import BaseModel
from api_helpers.metric import calc_max_daily_streak, \
    calc_curr_streak, calc_repeat_partners, prep_duration_pie_data, prep_punctuality_pie_data, prep_chart_data_by_past_range, prep_chart_data_by_time, \
    prep_heatmap_data, prep_history_data, prep_chart_data_by_range
from api_helpers.supabase import get_weekly_goal, update_daily_streak
from api_helpers.time import get_end_of_week, get_start_of_week, \
    ms_to_h, get_start_of_prev_week
from api_helpers.request import get_access_token, get_session_id
from api_helpers.focusmate import fetch_focusmate_profile, get_data
import os
from fastapi import Depends, FastAPI
from dotenv import load_dotenv
from cachetools import TTLCache
from cachetools.keys import hashkey
import ssl
ssl._create_default_https_context = ssl._create_stdlib_context


app = FastAPI()
load_dotenv()
cache = TTLCache(maxsize=100, ttl=60)


fm_api_profile_endpoint = os.getenv("NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT")
fm_api_sessions_endpoint = os.getenv("NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT")

SessionIdDep = Annotated[str, Depends(get_session_id)]


@app.get("/api/py/streak")
async def streak(session_id: SessionIdDep):
    profile, sessions = await get_data(session_id, cache)

    all_sessions = sessions.copy()
    sessions = sessions[sessions['completed'] == True]
    local_timezone: str = profile.get("timeZone")

    daily_streak = calc_curr_streak(sessions, "D", local_timezone)
    update_daily_streak(profile.get("userId"), daily_streak)

    return {
        "daily_streak": daily_streak,
        "weekly_streak": calc_curr_streak(sessions, "W", local_timezone),
        "monthly_streak": calc_curr_streak(sessions, "M", local_timezone),
        "max_daily_streak": calc_max_daily_streak(sessions),
        "heatmap_data": prep_heatmap_data(sessions),
        "history_data": prep_history_data(all_sessions, head=3)
    }


@app.get("/api/py/goal")
async def goal(session_id: SessionIdDep):
    profile: dict = cache.get(
        hashkey('profile', session_id))

    if profile is None:
        access_token = get_access_token(session_id)
        profile = fetch_focusmate_profile(
            fm_api_profile_endpoint, access_token).get("user")

    return get_weekly_goal(profile.get("userId"))


@app.get("/api/py/weekly")
async def weekly(session_id: SessionIdDep):
    profile, sessions = await get_data(session_id, cache)
    sessions = sessions[sessions['completed'] == True]
    local_timezone: str = profile.get("timeZone")

    start_of_week = get_start_of_week(local_timezone)
    start_of_prev_week = get_start_of_prev_week(local_timezone)
    end_of_week = get_end_of_week(start_of_week)

    curr_week_sessions = sessions[sessions['start_time'] >= start_of_week]
    prev_week_sessions = sessions[
        (sessions['start_time'] >= start_of_prev_week) &
        (sessions['start_time'] < start_of_week)
    ]

    l4w_end_date = pd.Timestamp(datetime.datetime.now().date(
    ) - pd.DateOffset(days=pd.Timestamp(datetime.datetime.now().date()).dayofweek + 1))
    l4w_start_date = l4w_end_date - pd.DateOffset(weeks=4)
    l4w_sessions = sessions[
        (sessions['start_time'] >= l4w_start_date) &
        (sessions['start_time'] < l4w_end_date)
    ]

    return {
        "total": {
            "sessions": len(curr_week_sessions),
            "hours": ms_to_h(curr_week_sessions['duration'].sum()),
            "partners": len(curr_week_sessions['partner_id'].unique()),
            "repeat_partners": calc_repeat_partners(curr_week_sessions)
        },
        "prev_period_delta": {
            "sessions": len(curr_week_sessions) - len(prev_week_sessions),
            "hours": ms_to_h(curr_week_sessions['duration'].sum() -
                             prev_week_sessions['duration'].sum())
        },
        "chart": {
            "range": prep_chart_data_by_range(
                curr_week_sessions, start_of_week, end_of_week),
            "time": prep_chart_data_by_time(curr_week_sessions),
            "l4w": prep_chart_data_by_past_range(
                l4w_sessions, l4w_start_date, l4w_end_date),
            "pie": prep_duration_pie_data(curr_week_sessions),
            "punctuality": prep_punctuality_pie_data(curr_week_sessions)
        }
    }


class Item(BaseModel):
    page_index: int
    page_size: int


@app.post("/api/py/history")
async def streak(session_id: SessionIdDep, item: Item):
    _, sessions = await get_data(session_id, cache)
    data = prep_history_data(sessions)
    return {
        "rows": data[item.page_index * item.page_size:
                     (item.page_index + 1) * item.page_size],
        "row_count": len(data)
    }


@app.get("/api/py/history-all")
async def streak(session_id: SessionIdDep):
    _, sessions = await get_data(session_id, cache)
    return prep_history_data(sessions)
