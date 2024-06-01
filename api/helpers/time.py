from datetime import datetime, timedelta, timezone
from dateutil import tz, parser


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


def ms_to_minutes(ms: float):
    return int(ms / 60000)


def minutes_to_ms(minutes: int):
    return minutes * 60000
