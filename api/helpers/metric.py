import pandas as pd
from typing import Literal


def calculate_recent_streak(sessions: pd.DataFrame, period: Literal["D", "W", "M"]) -> int:
    '''
    Calculate either daily, weekly, or monthly session streak in recent periods.
    A recent streak is defined as the number of consecutive periods most recently
    with at least one session, excluding the current period.

    Parameters
    ----------
    sessions : pd.DataFrame
        A DataFrame containing all completed sessions.
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


def calculate_longest_daily_streak(sessions: pd.DataFrame,
                                   include_weekend_in_daily_streak: bool) -> tuple[int, tuple[str, str]]:
    '''
    Calculate the longest daily session streak count and date range.

    Parameters
    ----------
    sessions : pd.DataFrame
        A DataFrame containing all completed sessions.
    include_weekend_in_daily_streak : bool
        Whether to include weekends in the daily streak calculation.

    Returns
    -------
    tuple[int, tuple[str, str]]
        The longest daily session streak count and date range.
    '''
    sessions_copy = sessions.copy()

    sessions_copy['date'] = sessions_copy['start_time'].dt.date
    sessions_copy.sort_values('date', inplace=True)
    sessions_copy['day_over_day_delta'] = sessions_copy['date'].diff().dt.days

    if not include_weekend_in_daily_streak:
        sessions_copy = sessions_copy[sessions_copy['start_time'].dt.weekday < 5]

        def adjust_delta(row):
            day_over_day_delta = row['day_over_day_delta']

            # Handle the first row, where delta is NaN
            if pd.isna(day_over_day_delta):
                return day_over_day_delta

            if day_over_day_delta > 1:
                # Friday to Monday should be considered consecutive
                prev_day = row['date'] - pd.Timedelta(days=day_over_day_delta)
                if prev_day.weekday() == 4 and row['date'].weekday() == 0:
                    return 1
            return day_over_day_delta

        sessions_copy['day_over_day_delta'] = sessions_copy.apply(
            adjust_delta, axis=1)

    sessions_copy['consecutive_day_group_id'] = (
        sessions_copy['day_over_day_delta'] != 1).cumsum()

    streak_lengths = sessions_copy.groupby('consecutive_day_group_id').size()

    # Convert to int to avoid numpy int64 type (not supported by FastAPI)
    longest_streak = int(streak_lengths.max())

    longest_streak_id = streak_lengths.idxmax()
    longest_streak_dates = sessions_copy.loc[sessions_copy['consecutive_day_group_id']
                                             == longest_streak_id, 'date']
    longest_streak_start_date = longest_streak_dates.min()
    longest_streak_end_date = longest_streak_dates.max()

    return {
        'longest_streak': longest_streak,
        'longest_streak_dates': [longest_streak_start_date, longest_streak_end_date]
    }
