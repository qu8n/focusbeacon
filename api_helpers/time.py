from datetime import datetime, timedelta
import warnings
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


def get_curr_week_start(local_timezone: str):
    today_local = datetime.now(tz.gettz(local_timezone))
    monday = today_local - timedelta(days=today_local.weekday())
    curr_week_start = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        curr_week_start_dt64 = np.datetime64(curr_week_start)
    return curr_week_start_dt64


def ms_to_m(ms: int):
    return int(round(ms / 60000))


def ms_to_h(ms: int):
    return int(round(ms / 3600000))


def m_to_ms(minutes: int):
    return minutes * 60000
