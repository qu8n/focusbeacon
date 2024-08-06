
import asyncio
from contextlib import asynccontextmanager
from typing import Annotated
from fastapi.responses import JSONResponse
import pandas as pd
from pydantic import BaseModel
from api_utils.faker import get_fake_data
from api_utils.metric import calc_max_daily_streak, \
    calc_curr_streak, calc_repeat_partners, prep_duration_pie_data, \
    prep_punctuality_pie_data, prep_chart_data_by_past_range, \
    prep_chart_data_by_hour, prep_heatmap_data, prep_history_data, \
    prep_chart_data_by_range
from api_utils.supabase import get_weekly_goal, update_daily_streak, update_weekly_goal
from api_utils.time import format_date_label, get_curr_month_start, get_curr_week_start, get_curr_year_start, ms_to_h
from api_utils.request import get_session_id
from api_utils.focusmate import get_data
from fastapi import Depends, FastAPI, BackgroundTasks, HTTPException
from cachetools import TTLCache
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


@app.get("/api/py/signin-status")
async def get_signin_status(session_id: SessionIdDep):
    if not session_id:
        raise HTTPException(status_code=400, detail="No session ID found")

    profile, _ = await get_data(
        session_id, user_data_cache, demo_data_cache, demo=False)

    if not profile:
        raise HTTPException(
            status_code=400, detail="No user found in database")

    return JSONResponse(content={"message": "User has a valid session ID"},
                        status_code=200)


@app.get("/api/py/profile-photo")
async def get_profile_photo(session_id: SessionIdDep):
    profile, _ = await get_data(
        session_id, user_data_cache, demo_data_cache, demo=False)

    return JSONResponse(content={"photo_url": profile.get("photoUrl")})


@app.get("/api/py/streak")
async def get_streak(session_id: SessionIdDep, demo: bool = False):
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
async def get_goal(session_id: SessionIdDep, demo: bool = False):
    if demo:
        return 10
    profile, _ = await get_data(
        session_id, user_data_cache, demo_data_cache, demo)
    return get_weekly_goal(profile.get("userId"))


class Goal(BaseModel):
    goal: int


@app.post("/api/py/goal")
async def set_goal(session_id: SessionIdDep, goal: Goal):
    profile, _ = await get_data(
        session_id, user_data_cache, demo_data_cache)
    return update_weekly_goal(profile.get("userId"), goal.goal)


@app.get("/api/py/week")
async def get_week(session_id: SessionIdDep, demo: bool = False):
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

    date_label_format = "%A, %b %d"

    return {
        "curr_period": {
            "start_label": format_date_label(curr_week_start, date_label_format),
            "end_label": format_date_label(curr_week_end, date_label_format),
            "sessions_total": len(curr_week_sessions),
            "sessions_delta": len(curr_week_sessions) - len(prev_week_sessions),
            "hours_total": ms_to_h(curr_week_sessions['duration'].sum()),
            "hours_delta": ms_to_h(curr_week_sessions['duration'].sum() -
                                   prev_week_sessions['duration'].sum()),
            "partners_total": len(curr_week_sessions['partner_id'].unique()),
            "partners_repeat": calc_repeat_partners(curr_week_sessions),
            "chart_data": prep_chart_data_by_range(
                curr_week_sessions, curr_week_start, curr_week_end, "week"),
        },
        "prev_period": {
            "start_label": format_date_label(l4w_start, date_label_format),
            "end_label": format_date_label(l4w_end, date_label_format),
            "sessions_total": len(l4w_sessions),
            "week": prep_chart_data_by_past_range(
                l4w_sessions, l4w_start, l4w_end, "week"),
            "punctuality": prep_punctuality_pie_data(l4w_sessions),
            "duration": prep_duration_pie_data(l4w_sessions),
            "time": prep_chart_data_by_hour(l4w_sessions)
        }
    }


@app.get("/api/py/month")
async def get_month(session_id: SessionIdDep, demo: bool = False):
    profile, sessions = await get_data(
        session_id, user_data_cache, demo_data_cache, demo)

    if profile.get("totalSessionCount") == 0:
        return {
            "zero_sessions": True
        }

    sessions = sessions[sessions['completed'] == True]
    local_timezone: str = profile.get("timeZone")

    curr_month_start = get_curr_month_start(local_timezone)
    curr_month_end = curr_month_start + pd.DateOffset(months=1, days=-1)
    prev_month_start = curr_month_start - pd.DateOffset(months=1)
    l6m_start = curr_month_start - pd.DateOffset(months=6)
    l6m_end = curr_month_end - pd.DateOffset(months=1)

    curr_month_sessions = sessions[sessions['start_time'] >= curr_month_start]
    prev_month_sessions = sessions[
        (sessions['start_time'] >= prev_month_start) &
        (sessions['start_time'] < curr_month_start)
    ]
    l6m_sessions = sessions[
        (sessions['start_time'] >= l6m_start) &
        (sessions['start_time'] < curr_month_start)
    ]

    date_format = "%B %Y"

    return {
        "curr_period": {
            "start_label": format_date_label(curr_month_start, date_format),
            "sessions_total": len(curr_month_sessions),
            "sessions_delta": len(curr_month_sessions) - len(prev_month_sessions),
            "hours_total": ms_to_h(curr_month_sessions['duration'].sum()),
            "hours_delta": ms_to_h(curr_month_sessions['duration'].sum() -
                                   prev_month_sessions['duration'].sum()),
            "partners_total": len(curr_month_sessions['partner_id'].unique()),
            "partners_repeat": calc_repeat_partners(curr_month_sessions),
            "chart_data": prep_chart_data_by_range(
                curr_month_sessions, curr_month_start, curr_month_end, "month"),
        },
        "prev_period": {
            "start_label": format_date_label(l6m_start, date_format),
            "end_label": format_date_label(l6m_end, date_format),
            "sessions_total": len(l6m_sessions),
            "month": prep_chart_data_by_past_range(
                l6m_sessions, l6m_start, l6m_end, "month"),
            "punctuality": prep_punctuality_pie_data(l6m_sessions),
            "duration": prep_duration_pie_data(l6m_sessions),
            "time": prep_chart_data_by_hour(l6m_sessions)
        }
    }


@app.get("/api/py/year")
async def get_year(session_id: SessionIdDep, demo: bool = False):
    profile, sessions = await get_data(
        session_id, user_data_cache, demo_data_cache, demo)

    if profile.get("totalSessionCount") == 0:
        return {
            "zero_sessions": True
        }

    sessions = sessions[sessions['completed'] == True]
    local_timezone: str = profile.get("timeZone")

    curr_year_start = get_curr_year_start(local_timezone)
    curr_year_end = curr_year_start + pd.DateOffset(years=1, days=-1)
    prev_year_start = curr_year_start - pd.DateOffset(years=1)
    prev_year_end = curr_year_end - pd.DateOffset(years=1)

    curr_year_sessions = sessions[sessions['start_time'] >= curr_year_start]
    prev_year_sessions = sessions[
        (sessions['start_time'] >= prev_year_start) &
        (sessions['start_time'] < curr_year_start)
    ]

    date_format = "%B %Y"

    return {
        "curr_period": {
            "start_label": format_date_label(curr_year_start, date_format),
            "sessions_total": len(curr_year_sessions),
            "sessions_delta": len(curr_year_sessions) - len(prev_year_sessions),
            "hours_total": ms_to_h(curr_year_sessions['duration'].sum()),
            "hours_delta": ms_to_h(curr_year_sessions['duration'].sum() -
                                   prev_year_sessions['duration'].sum()),
            "partners_total": len(curr_year_sessions['partner_id'].unique()),
            "partners_repeat": calc_repeat_partners(curr_year_sessions),
            "chart_data": prep_chart_data_by_range(
                curr_year_sessions, curr_year_start, curr_year_end, "year"),
        },
        "prev_period": {
            "start_label": format_date_label(prev_year_start, date_format),
            "end_label": format_date_label(prev_year_end, date_format),
            "sessions_total": len(prev_year_sessions),
            "year": prep_chart_data_by_past_range(
                prev_year_sessions, prev_year_start, prev_year_end, "year"),
            "punctuality": prep_punctuality_pie_data(prev_year_sessions),
            "duration": prep_duration_pie_data(prev_year_sessions),
            "time": prep_chart_data_by_hour(prev_year_sessions)
        }
    }


class Pagination(BaseModel):
    page_index: int
    page_size: int


@app.post("/api/py/history")
async def get_history_paginated(session_id: SessionIdDep,
                                pagination: Pagination, demo: bool = False):
    profile, sessions = await get_data(
        session_id, user_data_cache, demo_data_cache, demo)

    if profile.get("totalSessionCount") == 0:
        return {
            "zero_sessions": True
        }

    data = prep_history_data(sessions)
    return {
        "rows": data[pagination.page_index * pagination.page_size:
                     (pagination.page_index + 1) * pagination.page_size],
        "row_count": len(data)
    }


@app.get("/api/py/history-all")
async def get_history_all(session_id: SessionIdDep):
    _, sessions = await get_data(
        session_id, user_data_cache, demo_data_cache)
    return prep_history_data(sessions)
