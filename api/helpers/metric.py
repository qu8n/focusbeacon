import pandas as pd
from typing import Literal


def calculate_streak(sessions: pd.DataFrame, period: Literal["D", "W", "M"]) -> int:
    '''
    Calculate either daily, weekly, or monthly session streak. A streak is defined as the
    number of consecutive periods with at least one session, excluding the current period.

    Parameters
    ----------
    sessions : pd.DataFrame
        A DataFrame containing all sessions.
    period : Literal["D", "W", "M"]
        The period to calculate the streak for. D for daily, W for weekly, M for monthly.

    Returns
    -------
    int
        The calculated streak.
    '''
    sessions_copy = sessions.copy()

    sessions_copy['period'] = sessions_copy['start_time'].dt.to_period(period)

    curr_period = pd.Timestamp.today().to_period(period)
    recently_completed_period = (curr_period - 1)

    period_range_lifetime = pd.period_range(
        start=sessions_copy['period'].min(), end=recently_completed_period, freq=period)

    periods_with_session = set(sessions_copy['period'])

    period_streak = 0
    for period in reversed(period_range_lifetime):
        if period in periods_with_session:
            period_streak += 1
        else:
            break

    if curr_period in periods_with_session:
        period_streak += 1

    return period_streak
