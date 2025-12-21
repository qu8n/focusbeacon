from datetime import datetime, timedelta
from typing import Literal
from dateutil import tz, parser
import pandas as pd

fm_datetime_str_format = '%Y-%m-%dT%H:%M:%SZ'

WeekStartDay = Literal["sunday", "monday"]


def utc_dt_to_local_dt(utc_time: datetime, local_timezone: str):
    local_timezone_obj = tz.gettz(local_timezone)
    local_time = utc_time.replace(
        tzinfo=tz.tzutc()).astimezone(local_timezone_obj)
    return local_time


def fm_time_str_to_dt(fm_time_str: str | None):
    if fm_time_str is None:
        return None
    dt = parser.parse(fm_time_str)
    return dt


def fm_time_str_to_local_dt(fm_time_str: str | None, local_timezone: str):
    if fm_time_str is None:
        return None
    utc_dt = fm_time_str_to_dt(fm_time_str)
    local_dt = utc_dt_to_local_dt(utc_dt, local_timezone)
    return local_dt


def local_dt_to_utc_dt(local_time: datetime, local_timezone: str):
    local_timezone_obj = tz.gettz(local_timezone)
    utc_dt = local_time.replace(
        tzinfo=local_timezone_obj).astimezone(tz.tzutc())
    return utc_dt


def dt_to_fm_time_str(datetime_obj: datetime):
    fm_time_str = datetime_obj.strftime(fm_datetime_str_format)
    return fm_time_str


def get_curr_week_start(local_timezone: str,
                        week_start: WeekStartDay = "monday"):
    today = get_naive_local_today(local_timezone)
    if week_start == "sunday":
        # Sunday = 6 in weekday(), shift so Sunday = 0
        days_since_week_start = (today.weekday() + 1) % 7
    else:  # monday
        days_since_week_start = today.weekday()
    week_start_date = today - timedelta(days=days_since_week_start)
    return week_start_date.replace(hour=0, minute=0, second=0, microsecond=0)


def get_curr_month_start(local_timezone: str):
    today = get_naive_local_today(local_timezone)
    first_day_of_month = today.replace(day=1)
    return first_day_of_month.replace(
        hour=0, minute=0, second=0, microsecond=0)


def get_curr_year_start(local_timezone: str):
    today = get_naive_local_today(local_timezone)
    first_day_of_year = today.replace(day=1, month=1)
    return first_day_of_year.replace(
        hour=0, minute=0, second=0, microsecond=0)


def get_naive_local_today(local_timezone):
    """Get today in local timezone without timezone info. This enables
    simplification and lets us work with the dates in the sessions dataframe
    that have also been localized and stripped of timezone info."""
    today_local = pd.Timestamp.now(tz.gettz(local_timezone))
    today_naive = today_local.replace(tzinfo=None)
    return today_naive


def ms_to_m(ms: int):
    return int(round(ms / 60000))


def ms_to_h(ms: int):
    return int(round(ms / 3600000))


def m_to_ms(minutes: int):
    return minutes * 60000


def format_date_label(date: pd.Timestamp, format: str):
    return date.strftime(format).replace(' 0', ' ')
