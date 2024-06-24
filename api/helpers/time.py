from datetime import datetime, timedelta
from dateutil import tz, parser
import numpy as np

fm_datetime_str_format = '%Y-%m-%dT%H:%M:%SZ'


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


def get_start_of_week(local_timezone: str):
    '''Returns the start of the current week in the given timezone, defined as
    00:00:00 on Monday of the current week.'''
    today_local = datetime.now(tz.gettz(local_timezone))
    monday = today_local - timedelta(days=today_local.weekday())
    start_of_week = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    return np.datetime64(start_of_week)


def get_start_of_prev_week(local_timezone: str):
    '''Returns the start of the previous week in the given timezone, defined as
    00:00:00 on Monday of the previous week.'''
    start_of_week = get_start_of_week(local_timezone)
    return start_of_week - np.timedelta64(7, 'D')


def ms_to_minutes(ms: float):
    return int(round(ms / 60000))


def ms_to_hours(ms: float):
    return int(round(ms / 3600000))


def minutes_to_ms(minutes: int):
    return minutes * 60000
