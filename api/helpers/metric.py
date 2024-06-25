import pandas as pd
from typing import Literal


def calculate_curr_streak(sessions: pd.DataFrame,
                          period_type: Literal["D", "W", "M"],
                          local_timezone: str,
                          weekend_breaks_daily_streak: bool = False) \
        -> int:
    '''
    Calculate either daily, weekly, or monthly session streak in recent
    periods. A recent streak is defined as the number of consecutive periods
    most recently with at least one session.

    Not having a session today/this week/this month does not break the streak,
    but having it does increase the streak.

    Parameters
    ----------
    sessions : pd.DataFrame
        A DataFrame containing all completed sessions.
    period : Literal["D", "W", "M"]
        The period to calculate the streak for. D for daily, W for weekly, M
        for monthly.

    Returns
    -------
    int
        The calculated streak corresponding to the period.
    '''
    sessions_copy = sessions.copy()

    sessions_copy['period'] = sessions_copy['start_time'].dt.to_period(
        period_type)

    curr_period = pd.Timestamp.today(local_timezone).to_period(period_type)
    recently_completed_period = (curr_period - 1)

    period_range_lifetime = pd.period_range(
        start=sessions_copy['period'].min(), end=recently_completed_period,
        freq=period_type)

    periods_with_session = set(sessions_copy['period'])

    period_streak = 0
    for period in reversed(period_range_lifetime):
        if period in periods_with_session:
            period_streak += 1
        else:
            if not weekend_breaks_daily_streak and period_type == "D":
                if period.to_timestamp().weekday() > 4:
                    continue
            break

    if curr_period in periods_with_session:
        period_streak += 1

    return period_streak


def calculate_max_daily_streak(sessions: pd.DataFrame,
                               weekend_breaks_daily_streak: bool = False) \
        -> dict:
    '''
    Calculate the max daily session streak count and date range.

    Parameters
    ----------
    sessions : pd.DataFrame
        A DataFrame containing all completed sessions.
    weekend_breaks_daily_streak : bool
        Whether the daily streak should be broken by weekends.

    Returns
    -------
    dict
        A dictionary containing the max daily session streak count, and the
        start and end dates of the streak.
    '''
    # Create a modified DataFrame with only unique dates of the sessions
    sessions_copy = sessions.copy()
    sessions_copy['start_date'] = sessions_copy['start_time'].dt.date
    sessions_copy = sessions_copy.groupby(
        'start_date').size().reset_index(name='count')

    max_streak = 0
    max_streak_start = None
    max_streak_end = None
    current_streak = 1
    current_streak_start = sessions_copy['start_date'].iloc[0]

    for i in range(1, len(sessions_copy)):
        current_date = sessions_copy['start_date'].iloc[i]
        previous_date = sessions_copy['start_date'].iloc[i - 1]
        current_day = current_date.weekday()
        previous_day = previous_date.weekday()

        # Increment the streak for consecutive days
        if current_date == previous_date + pd.Timedelta(days=1):
            current_streak += 1
        # If weekend doesn't break the streak, increment the streak if there
        # are sessions on one or none of the weekend days
        elif not weekend_breaks_daily_streak and \
            ((current_day == 0 and (previous_day == 4 or previous_day == 5))
             or (current_day == 6 and previous_day == 4)):
            current_streak += 1
        else:
            if current_streak > max_streak:
                max_streak = current_streak
                max_streak_start = current_streak_start
                max_streak_end = previous_date

            current_streak = 1
            current_streak_start = current_date

    # Final check in case the max streak is at the end of the dataframe
    if current_streak > max_streak:
        max_streak = current_streak
        max_streak_start = current_streak_start
        max_streak_end = sessions_copy['start_date'].iloc[-1]

    return {
        'count': max_streak,
        'date_range': [
            max_streak_start,
            max_streak_end
        ]
    }


def prepare_heatmap_data(sessions: pd.DataFrame) -> dict:
    '''
    Prepare data for the Nivo TimeRange calendar component

    Parameters
    ----------
    sessions : pd.DataFrame
        A DataFrame containing all completed sessions.

    Returns
    -------
    dict
        A dictionary containing data for the "from", "to", and "data" props of
        the Nivo TimeRange calendar component, as well as the total number of
        sessions in the past year.
    '''

    # Nivo TimeRange calendar component's 'to' date is exclusive, so we need to
    # add one day to the current date
    tomorrow = pd.Timestamp.today() + pd.DateOffset(days=1)
    tomorrow_str = tomorrow.strftime('%Y-%m-%d')

    # Nivo TimeRange calendar component begins on Monday, so we need the Monday
    # of the week one year ago as the 'from' date
    one_year_ago = tomorrow - pd.DateOffset(years=1)
    one_year_ago_monday = one_year_ago - pd.DateOffset(
        days=one_year_ago.weekday())
    one_year_ago_monday_str = one_year_ago_monday.strftime('%Y-%m-%d')

    sessions_copy = sessions.copy()
    sessions_copy = sessions_copy[
        (sessions_copy['start_time'] >= one_year_ago_monday) &
        (sessions_copy['start_time'] <= tomorrow)
    ]

    # Prepare data for the Nivo TimeRange calendar component
    sessions_copy['start_date_str'] = \
        sessions_copy['start_time'].dt.strftime('%Y-%m-%d')
    heatmap_data = sessions_copy.groupby('start_date_str').size()
    heatmap_data = heatmap_data.reset_index()
    heatmap_data.columns = ['day', 'value']  # expected by Nivo calendar
    heatmap_data = heatmap_data.to_dict(orient='records')

    past_year_sessions = len(sessions_copy)

    return {
        "from": one_year_ago_monday_str,
        "to": tomorrow_str,
        "data": heatmap_data,
        "past_year_sessions": past_year_sessions
    }


def prepare_sessions_chart_data_by_duration(sessions: pd.DataFrame) -> dict:
    sessions_copy = sessions.copy()
    sessions_copy['start_date_str'] = \
        sessions_copy['start_time'].dt.strftime('%b %y')
    sessions_chart_df = sessions_copy.pivot_table(index='start_date_str',
                                                  columns='duration',
                                                  aggfunc='size',
                                                  fill_value=0)
    sessions_chart_df = sessions_chart_df.reset_index()
    sessions_chart_df.columns.name = None
    return sessions_chart_df.to_dict(orient='records')
