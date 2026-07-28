import asyncio
from typing import Annotated, Literal
from fastapi.responses import JSONResponse
import pandas as pd
from pydantic import BaseModel, Field, model_validator
from api_utils.metric import calc_max_daily_streak, \
    calc_curr_streak, calc_repeat_partners, calc_daily_record, calc_cumulative_sessions_chart, calc_duration_pie_data, \
    calc_punctuality_pie_data, calc_chart_data_by_hour, calc_heatmap_data, \
    calc_time_heatmap_data, calc_history_data, calc_chart_data_by_range
from api_utils.supabase import get_weekly_goal, update_daily_streak, \
    update_weekly_goal
from api_utils.time import format_date_label, get_curr_day_start, \
    get_curr_month_start, get_curr_week_start, get_curr_year_start, \
    ms_to_h_decimal, ms_to_m, WeekStartDay
from api_utils.request import get_session_id, get_access_token, SessionNotFound
from api_utils.focusmate import get_data
from fastapi import Depends, FastAPI, HTTPException
from cachetools import TTLCache


app = FastAPI()
user_data_cache = TTLCache(maxsize=100, ttl=60)
SessionIdDep = Annotated[str, Depends(get_session_id)]


async def load_user_data(session_id: str):
    """Same as get_data, but rejects a session it can't resolve instead of
    handing back None. get_data returns (None, None) for a cleared cookie, a
    deleted profile row, or a token it can't decrypt, and every route below
    reads off `profile` immediately -- so without this the user gets an
    AttributeError and a 500 where they should get a 401."""
    profile, sessions = await get_data(session_id, user_data_cache)

    if not profile:
        raise HTTPException(
            status_code=401, detail="Invalid or expired session")

    return profile, sessions


@app.get("/api/py/signin-status")
async def get_signin_status(session_id: SessionIdDep):
    if not session_id:
        raise HTTPException(status_code=400, detail="No session ID found")

    # Resolve the session and nothing else. This used to call get_data, which
    # fetches the Focusmate profile and every year of session history before it
    # could answer -- so the client's route guard paid for a full sync on every
    # page load, and any Focusmate hiccup came back non-2xx and read to the
    # client as "signed out", bouncing a valid user to /home.
    try:
        await asyncio.to_thread(get_access_token, session_id)
    except SessionNotFound:
        raise HTTPException(
            status_code=400, detail="No user found in database")

    return JSONResponse(content={"message": "User has a valid session ID"},
                        status_code=200)


@app.get("/api/py/profile-photo")
async def get_profile_photo(session_id: SessionIdDep):
    profile, _ = await load_user_data(session_id)

    return JSONResponse(content={"photo_url": profile.get("photoUrl")})


@app.get("/api/py/streak")
async def get_streak(session_id: SessionIdDep,
                     week_start: WeekStartDay = "monday"):
    profile, sessions = await load_user_data(session_id)

    all_sessions = sessions.copy()
    sessions = sessions[sessions['completed'] == True]

    # Guard on completed sessions rather than profile.totalSessionCount, which
    # counts bookings: a user who booked and never showed up clears that check
    # and then hits min()/mean()/idxmax() on an empty frame
    if sessions.empty:
        return {
            "zero_sessions": True
        }

    local_timezone: str = profile.get("timeZone")

    daily_streak = calc_curr_streak(sessions, "D", local_timezone)

    # Blocking Supabase client, same as get_access_token: off the event loop so
    # one slow round trip doesn't stall every other request sharing this
    # instance
    daily_streak_increased = await asyncio.to_thread(
        update_daily_streak, profile.get("userId"), daily_streak)

    curr_day_start = get_curr_day_start(local_timezone)
    prev_day_start = curr_day_start - pd.DateOffset(days=1)

    curr_day_sessions = sessions[sessions['start_time'] >= curr_day_start]
    prev_day_sessions = sessions[
        (sessions['start_time'] >= prev_day_start) &
        (sessions['start_time'] < curr_day_start)
    ]

    curr_day_hours = ms_to_h_decimal(curr_day_sessions['duration'].sum())
    prev_day_hours = ms_to_h_decimal(prev_day_sessions['duration'].sum())

    return {
        "daily_streak": daily_streak,
        "daily_streak_increased": daily_streak_increased,
        "weekly_streak": calc_curr_streak(sessions, "W", local_timezone,
                                          week_start=week_start),
        "monthly_streak": calc_curr_streak(sessions, "M", local_timezone),
        "max_daily_streak": calc_max_daily_streak(sessions),
        "heatmap_data": calc_heatmap_data(sessions, local_timezone,
                                          week_start=week_start),
        "time_heatmap_data": calc_time_heatmap_data(sessions, local_timezone,
                                                    week_start=week_start),
        "history_data": calc_history_data(
            all_sessions, local_timezone, head=3),
        "daily": {
            "subheading": format_date_label(curr_day_start, "%A, %b %d"),
            "sessions_total": len(curr_day_sessions),
            "sessions_delta": len(curr_day_sessions) - len(prev_day_sessions),
            "hours_total": curr_day_hours,
            # Deltas come off the rounded hours so they always reconcile with
            # the two numbers a user can actually see
            "hours_delta": round(curr_day_hours - prev_day_hours, 1),
            "partners_total": curr_day_sessions['partner_id'].nunique(),
            "partners_repeat": calc_repeat_partners(curr_day_sessions),
            "period_type": "day",
        },
        "charts": {
            "hour": calc_chart_data_by_hour(curr_day_sessions)
        }
    }


# A week holds 336 half-hour slots and 10,080 minutes. Anything beyond either
# is a typo rather than an ambitious week. Keyed by goal type as
# (limit, unit name for the error message).
GOAL_BOUNDS = {
    "sessions": (336, "sessions"),
    "hours": (10080, "minutes"),
}
# Sent with every goal response so the client enforces these same bounds
# without keeping its own copy of the numbers
GOAL_LIMITS = {
    "max_sessions": GOAL_BOUNDS["sessions"][0],
    "max_minutes": GOAL_BOUNDS["hours"][0],
}


class Goal(BaseModel):
    """`goal` counts sessions when `goal_type` is "sessions" and minutes when
    it is "hours". 0 means no goal."""
    goal: int = Field(ge=0)
    goal_type: Literal["sessions", "hours"] = "sessions"

    @model_validator(mode="after")
    def check_goal_within_a_week(self):
        max_goal, unit = GOAL_BOUNDS[self.goal_type]
        if self.goal > max_goal:
            raise ValueError(
                f"A weekly goal cannot exceed {max_goal} {unit}")
        return self


@app.get("/api/py/goal")
async def get_goal(session_id: SessionIdDep):
    profile, _ = await load_user_data(session_id)
    goal = await asyncio.to_thread(get_weekly_goal, profile.get("userId"))
    return {**goal, **GOAL_LIMITS}


@app.post("/api/py/goal")
async def set_goal(session_id: SessionIdDep, goal: Goal):
    profile, _ = await load_user_data(session_id)
    saved = await asyncio.to_thread(
        update_weekly_goal, profile.get("userId"), goal.goal, goal.goal_type)
    return {**saved, **GOAL_LIMITS}


@app.get("/api/py/week")
async def get_week(session_id: SessionIdDep,
                   week_start: WeekStartDay = "monday"):
    profile, sessions = await load_user_data(session_id)

    sessions = sessions[sessions['completed'] == True]

    if sessions.empty:
        return {
            "zero_sessions": True
        }

    local_timezone: str = profile.get("timeZone")

    curr_week_start = get_curr_week_start(local_timezone, week_start)
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

    # Decimal hours here because an hours goal is measured against this number,
    # and whole hours would round away up to half an hour of progress
    curr_week_hours = ms_to_h_decimal(curr_week_sessions['duration'].sum())
    prev_week_hours = ms_to_h_decimal(prev_week_sessions['duration'].sum())

    return {
        "curr_period": {
            "subheading": f"{format_date_label(curr_week_start, date_label_format)} - {format_date_label(curr_week_end, date_label_format)}",
            "sessions_total": len(curr_week_sessions),
            "sessions_delta": len(curr_week_sessions) - len(prev_week_sessions),
            "hours_total": curr_week_hours,
            # Delta comes off the rounded hours so it reconciles with the two
            # numbers a user can actually see
            "hours_delta": round(curr_week_hours - prev_week_hours, 1),
            "partners_total": curr_week_sessions['partner_id'].nunique(),
            "partners_repeat": calc_repeat_partners(curr_week_sessions),
            "period_type": "week",
        },
        "prev_period": {
            "subheading": f"{format_date_label(l4w_start, date_label_format)} - {format_date_label(l4w_end, date_label_format)}",
            "sessions_total": len(l4w_sessions),
        },
        "charts": {
            "curr_period": calc_chart_data_by_range(
                curr_week_sessions, curr_week_start, curr_week_end, "D", "%a",
                week_start),
            "prev_period": calc_chart_data_by_range(
                l4w_sessions, l4w_start, l4w_end, "W", "%b %d", week_start),
            "punctuality": calc_punctuality_pie_data(l4w_sessions),
            "duration": calc_duration_pie_data(l4w_sessions),
            "hour": calc_chart_data_by_hour(l4w_sessions)
        }
    }


@app.get("/api/py/month")
async def get_month(session_id: SessionIdDep):
    profile, sessions = await load_user_data(session_id)

    sessions = sessions[sessions['completed'] == True]

    if sessions.empty:
        return {
            "zero_sessions": True
        }

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

    curr_month_hours = ms_to_h_decimal(curr_month_sessions['duration'].sum())
    prev_month_hours = ms_to_h_decimal(prev_month_sessions['duration'].sum())

    return {
        "curr_period": {
            "subheading": format_date_label(curr_month_start, date_format),
            "sessions_total": len(curr_month_sessions),
            "sessions_delta": len(curr_month_sessions) - len(prev_month_sessions),
            "hours_total": curr_month_hours,
            # Delta comes off the rounded hours so it reconciles with the two
            # numbers a user can actually see
            "hours_delta": round(curr_month_hours - prev_month_hours, 1),
            "partners_total": curr_month_sessions['partner_id'].nunique(),
            "partners_repeat": calc_repeat_partners(curr_month_sessions),
            "period_type": "month",
        },
        "prev_period": {
            "subheading": f"{format_date_label(l6m_start, date_format)} - {format_date_label(l6m_end, date_format)}",
            "sessions_total": len(l6m_sessions),
        },
        "charts": {
            "curr_period": calc_chart_data_by_range(
                curr_month_sessions, curr_month_start, curr_month_end, "D", "%-d"),
            "prev_period": calc_chart_data_by_range(
                l6m_sessions, l6m_start, l6m_end, "M", "%b %Y"),
            "punctuality": calc_punctuality_pie_data(l6m_sessions),
            "duration": calc_duration_pie_data(l6m_sessions),
            "hour": calc_chart_data_by_hour(l6m_sessions)
        }
    }


@app.get("/api/py/year")
async def get_year(session_id: SessionIdDep):
    profile, sessions = await load_user_data(session_id)

    sessions = sessions[sessions['completed'] == True]

    if sessions.empty:
        return {
            "zero_sessions": True
        }

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

    date_format = "%Y"

    curr_year_hours = ms_to_h_decimal(curr_year_sessions['duration'].sum())
    prev_year_hours = ms_to_h_decimal(prev_year_sessions['duration'].sum())

    return {
        "curr_period": {
            "subheading": format_date_label(curr_year_start, date_format),
            "sessions_total": len(curr_year_sessions),
            "sessions_delta": len(curr_year_sessions) - len(prev_year_sessions),
            "hours_total": curr_year_hours,
            # Delta comes off the rounded hours so it reconciles with the two
            # numbers a user can actually see
            "hours_delta": round(curr_year_hours - prev_year_hours, 1),
            "partners_total": curr_year_sessions['partner_id'].nunique(),
            "partners_repeat": calc_repeat_partners(curr_year_sessions),
            "period_type": "year",
        },
        "prev_period": {
            "sessions_total": len(prev_year_sessions),
            "hours_total": prev_year_hours,
            "partners_total": prev_year_sessions['partner_id'].nunique(),
            "partners_repeat": calc_repeat_partners(prev_year_sessions),
            "subheading": format_date_label(prev_year_start, date_format),
            "sessions_total": len(prev_year_sessions),
        },
        "charts": {
            "curr_period": calc_chart_data_by_range(
                curr_year_sessions, curr_year_start, curr_year_end, "M", "%b"),
            "prev_period": calc_chart_data_by_range(
                prev_year_sessions, prev_year_start, prev_year_end, "M", "%b"),
            "punctuality": calc_punctuality_pie_data(prev_year_sessions),
            "duration": calc_duration_pie_data(prev_year_sessions),
            "hour": calc_chart_data_by_hour(prev_year_sessions)
        }
    }


@app.get("/api/py/lifetime")
async def get_lifetime(session_id: SessionIdDep):
    profile, sessions = await load_user_data(session_id)

    sessions = sessions[sessions['completed'] == True]

    if sessions.empty:
        return {
            "zero_sessions": True
        }

    first_session_date = format_date_label(
        sessions['start_time'].min(), "%B %-d, %Y")

    return {
        "curr_period": {
            "subheading": f"{first_session_date} - Present",
            "sessions_total": profile.get("totalSessionCount"),
            "hours_total": ms_to_h_decimal(sessions['duration'].sum()),
            "partners_total": sessions['partner_id'].nunique(),
            "partners_repeat": calc_repeat_partners(sessions),
            "first_session_date": first_session_date,
            "average_duration": ms_to_m(sessions['duration'].mean()),
            "daily_record": calc_daily_record(sessions),
        },
        "charts": {
            "sessions_cumulative": calc_cumulative_sessions_chart(sessions),
            "duration": calc_duration_pie_data(sessions),
            "punctuality": calc_punctuality_pie_data(sessions),
            "hour": calc_chart_data_by_hour(sessions)
        },
    }


class Pagination(BaseModel):
    page_index: int
    page_size: int


@app.post("/api/py/history")
async def get_history_paginated(session_id: SessionIdDep,
                                pagination: Pagination):
    profile, sessions = await load_user_data(session_id)

    if sessions.empty:
        return {
            "zero_sessions": True
        }

    data = calc_history_data(sessions, profile.get("timeZone"))
    return {
        "rows": data[pagination.page_index * pagination.page_size:
                     (pagination.page_index + 1) * pagination.page_size],
        "row_count": len(data)
    }


@app.get("/api/py/history-all")
async def get_history_all(session_id: SessionIdDep):
    profile, sessions = await load_user_data(session_id)
    return calc_history_data(sessions, profile.get("timeZone"))
