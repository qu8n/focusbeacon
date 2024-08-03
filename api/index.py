
import asyncio
from contextlib import asynccontextmanager
from typing import Annotated
import pandas as pd
from pydantic import BaseModel
from api_utils.faker import get_fake_data
from api_utils.metric import calc_max_daily_streak, \
    calc_curr_streak, calc_repeat_partners, prep_duration_pie_data, \
    prep_punctuality_pie_data, prep_chart_data_by_past_range, \
    prep_chart_data_by_time, prep_heatmap_data, prep_history_data, \
    prep_chart_data_by_range
from api_utils.supabase import get_weekly_goal, update_daily_streak
from api_utils.time import get_curr_week_start, ms_to_h
from api_utils.request import get_access_token, get_session_id
from api_utils.focusmate import fetch_focusmate_profile, get_data
from fastapi import Depends, FastAPI, BackgroundTasks
from cachetools import TTLCache
from cachetools.keys import hashkey
import ssl


ssl._create_default_https_context = ssl._create_stdlib_context
app = FastAPI()
user_data_cache = TTLCache(maxsize=100, ttl=60)
demo_data_cache = TTLCache(maxsize=100, ttl=86400)
SessionIdDep = Annotated[str, Depends(get_session_id)]


async def auto_refresh_demo_data_cache():
    """Refresh the demo data cache automatically instead of waiting for a
    request after ttl expires to trigger the refresh."""
    while True:
        get_fake_data(demo_data_cache)
        await asyncio.sleep(86400)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # The code before `yield` gets executed before the rest of the app starts
    background_tasks = BackgroundTasks()
    background_tasks.add_task(auto_refresh_demo_data_cache)
    await background_tasks()
    yield


@app.get("/api/py/streak")
async def streak(session_id: SessionIdDep, demo: bool = False):
    profile, sessions = await get_data(
        session_id, user_data_cache, demo_data_cache, demo)

    if profile.get("totalSessionCount") == 0:
        return {
            "zero_sessions": True
        }

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
async def goal(session_id: SessionIdDep, demo: bool = False):
    if demo:
        return 10

    profile: dict = user_data_cache.get(
        hashkey('profile', session_id))

    if profile is None:
        access_token = get_access_token(session_id)
        profile = fetch_focusmate_profile(access_token).get("user")

    return get_weekly_goal(profile.get("userId"))


@app.get("/api/py/week")
async def week(session_id: SessionIdDep, demo: bool = False):
    profile, sessions = await get_data(
        session_id, user_data_cache, demo_data_cache, demo)

    if profile.get("totalSessionCount") == 0:
        return {
            "zero_sessions": True
        }

    sessions = sessions[sessions['completed'] == True]
    local_timezone: str = profile.get("timeZone")

    curr_week_start = get_curr_week_start(local_timezone)
    curr_week_end = curr_week_start + \
        pd.DateOffset(days=6, hours=23, minutes=59, seconds=59)
    prev_week_start = curr_week_start - pd.DateOffset(weeks=1)
    l4w_start = curr_week_start - pd.DateOffset(weeks=4)
    l4w_end = curr_week_end - pd.DateOffset(weeks=1)

    curr_week_sessions = sessions[sessions['start_time'] >= curr_week_start]
    prev_week_sessions = sessions[
        (sessions['start_time'] >= prev_week_start) &
        (sessions['start_time'] < curr_week_start)
    ]
    l4w_sessions = sessions[
        (sessions['start_time'] >= l4w_start) &
        (sessions['start_time'] < curr_week_start)
    ]

    # Date end labels are calculated separately to avoid timezone issues
    date_format = "%A, %b %d"
    curr_week_start_date = pd.to_datetime(
        str(curr_week_start)).strftime(date_format)
    curr_week_end_date = pd.to_datetime(
        str(curr_week_start + pd.DateOffset(days=6))).strftime(date_format)
    prev_weeks_start_date = pd.to_datetime(
        str(l4w_start)).strftime(date_format)
    prev_weeks_end_date = pd.to_datetime(
        str(l4w_start + pd.DateOffset(days=4*7-1))).strftime(date_format)

    return {
        "curr_week": {
            "start_date": curr_week_start_date,
            "end_date": curr_week_end_date,
            "sessions_total": len(curr_week_sessions),
            "sessions_delta": len(curr_week_sessions) - len(prev_week_sessions),
            "hours_total": ms_to_h(curr_week_sessions['duration'].sum()),
            "hours_delta": ms_to_h(curr_week_sessions['duration'].sum() -
                                   prev_week_sessions['duration'].sum()),
            "partners_total": len(curr_week_sessions['partner_id'].unique()),
            "partners_repeat": calc_repeat_partners(curr_week_sessions),
            "chart_data": prep_chart_data_by_range(
                curr_week_sessions, curr_week_start, curr_week_end),
        },
        "prev_weeks": {
            "start_date": prev_weeks_start_date,
            "end_date": prev_weeks_end_date,
            "sessions_total": len(l4w_sessions),
            "week": prep_chart_data_by_past_range(
                l4w_sessions, l4w_start, l4w_end),
            "punctuality": prep_punctuality_pie_data(l4w_sessions),
            "duration": prep_duration_pie_data(l4w_sessions),
            "time": prep_chart_data_by_time(l4w_sessions)
        }
    }


class Item(BaseModel):
    page_index: int
    page_size: int


@app.post("/api/py/history")
async def history(session_id: SessionIdDep, item: Item, demo: bool = False):
    profile, sessions = await get_data(
        session_id, user_data_cache, demo_data_cache, demo)

    if profile.get("totalSessionCount") == 0:
        return {
            "zero_sessions": True
        }

    data = prep_history_data(sessions)
    return {
        "rows": data[item.page_index * item.page_size:
                     (item.page_index + 1) * item.page_size],
        "row_count": len(data)
    }


@app.get("/api/py/history-all")
async def history_all(session_id: SessionIdDep):
    _, sessions = await get_data(
        session_id, user_data_cache, demo_data_cache)
    return prep_history_data(sessions)
