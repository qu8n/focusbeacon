import pandas as pd
from typing import Any, Dict, List, Literal
import numpy as np
from api_utils.time import get_naive_local_today, m_to_ms, ms_to_h


def calc_repeat_partners(sessions: pd.DataFrame) -> int:
    partner_session_counts = sessions['partner_id'].value_counts()
    return len(partner_session_counts[partner_session_counts > 1])


def calc_curr_streak(sessions: pd.DataFrame,
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
    sessions = sessions.copy()

    sessions['period'] = sessions['start_time'].dt.to_period(
        period_type)

    curr_period = get_naive_local_today(local_timezone).to_period(period_type)
    recently_completed_period = (curr_period - 1)

    period_range_lifetime = pd.period_range(
        start=sessions['period'].min(), end=recently_completed_period,
        freq=period_type)

    periods_with_session = set(sessions['period'])

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


def calc_max_daily_streak(sessions: pd.DataFrame,
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
    sessions = sessions.copy()

    sessions['start_date'] = sessions['start_time'].dt.date
    sessions = sessions.groupby(
        'start_date').size().reset_index(name='count')

    max_streak = 0
    max_streak_start = None
    max_streak_end = None
    current_streak = 1
    current_streak_start = sessions['start_date'].iloc[0]

    for i in range(1, len(sessions)):
        current_date = sessions['start_date'].iloc[i]
        previous_date = sessions['start_date'].iloc[i - 1]
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
        max_streak_end = sessions['start_date'].iloc[-1]

    return {
        'count': max_streak,
        'date_range': [
            max_streak_start,
            max_streak_end
        ]
    }


def calc_heatmap_data(sessions: pd.DataFrame) -> dict:
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

    sessions = sessions.copy()

    sessions = sessions[
        (sessions['start_time'] >= one_year_ago_monday) &
        (sessions['start_time'] <= tomorrow)
    ]

    # Prepare data for the Nivo TimeRange calendar component
    sessions['start_date_str'] = \
        sessions['start_time'].dt.strftime('%Y-%m-%d')
    heatmap_data = sessions.groupby('start_date_str').size()
    heatmap_data = heatmap_data.reset_index()
    heatmap_data.columns = ['day', 'value']  # expected by Nivo calendar
    heatmap_data = heatmap_data.to_dict(orient='records')

    past_year_sessions = len(sessions)

    return {
        "from": one_year_ago_monday_str,
        "to": tomorrow_str,
        "data": heatmap_data,
        "past_year_sessions": past_year_sessions
    }


def calc_chart_data_by_range(sessions: pd.DataFrame,
                             start_date: np.datetime64,
                             end_date: np.datetime64,
                             period_format: str,
                             strftime_format: str) -> List[Dict[str, Any]]:
    sessions = sessions.copy()

    # Format the start_time to the specified period
    sessions['start_period_str'] = sessions['start_time'].dt.to_period(period_format).apply(
        lambda r: r.start_time.strftime('%Y-%m-%d'))

    pivot_df: pd.DataFrame = pd.pivot_table(sessions,
                                            index='start_period_str',
                                            columns='duration',
                                            aggfunc='size',
                                            fill_value=0)
    pivot_df = pivot_df.reset_index()
    pivot_df.columns.name = None

    # Add columns for durations that had no sessions
    for duration in [1500000, 3000000, 4500000]:
        if duration not in pivot_df.columns:
            pivot_df[duration] = 0
    pivot_df.rename(columns={1500000: '25m',
                             3000000: '50m',
                             4500000: '75m'}, inplace=True)

    # Add rows for periods that had no sessions
    period_range = pd.period_range(
        start=start_date, end=end_date, freq=period_format)
    period_range_str = period_range.to_timestamp().strftime('%Y-%m-%d')
    missing_periods = [
        period for period in period_range_str if period not in pivot_df['start_period_str'].values]
    missing_period_df = pd.DataFrame({'start_period_str': missing_periods})
    pivot_df = pd.concat([pivot_df, missing_period_df],
                         ignore_index=True).fillna(0)

    pivot_df = pivot_df.sort_values('start_period_str')

    # Format the period string for display
    pivot_df['start_period_str'] = pd.to_datetime(
        pivot_df['start_period_str']).dt.strftime(strftime_format)

    return pivot_df.to_dict(orient='records')


def calc_chart_data_by_hour(sessions: pd.DataFrame) -> List[Dict[str, Any]]:
    sessions = sessions.copy()

    # Format start_time to hourly intervals
    sessions['start_time_hour'] = sessions['start_time'].dt.strftime(
        '%I %p').str.lstrip('0')

    pivot_df: pd.DataFrame = pd.pivot_table(sessions,
                                            index='start_time_hour',
                                            columns='duration',
                                            aggfunc='size',
                                            fill_value=0)
    pivot_df = pivot_df.reset_index()
    pivot_df.columns.name = None

    # Add columns for durations that had no sessions
    for duration in [1500000, 3000000, 4500000]:
        if duration not in pivot_df.columns:
            pivot_df[duration] = 0
    pivot_df.rename(columns={1500000: '25m',
                             3000000: '50m',
                             4500000: '75m'}, inplace=True)

    # Add rows for missing hourly intervals that had no sessions
    today = pd.Timestamp('today').normalize()
    time_range = pd.date_range(start=today, end=today + pd.Timedelta(
        days=1) - pd.Timedelta(minutes=1), freq='h').strftime('%I %p').str.lstrip('0')
    missing_times = [time for time in time_range
                     if time not in pivot_df['start_time_hour'].values]
    missing_time_df = pd.DataFrame({'start_time_hour': missing_times})
    pivot_df = pd.concat([pivot_df, missing_time_df],
                         ignore_index=True).fillna(0)

    # Sort smartly
    pivot_df['start_time_hour'] = pd.to_datetime(
        pivot_df['start_time_hour'], format='%I %p').dt.strftime('%I %p').str.lstrip('0')
    pivot_df['start_time_hour'] = pd.Categorical(
        pivot_df['start_time_hour'], time_range)
    pivot_df = pivot_df.sort_values('start_time_hour')

    return pivot_df.to_dict(orient='records')


def calc_history_data(sessions: pd.DataFrame, head: int = None):
    '''Converts the sessions DataFrame into a list of dictionaries containing
    the data for the history table.

    Parameters
    ----------
    sessions : pd.DataFrame
        A DataFrame containing all completed sessions.

    Returns
    -------
    List[Dict[str, Any]]
        A list of dictionaries containing the data for the history table:

        session_id : str
            The session UUID generated by Focusmate.
        date: str
            The date of the session in the format 'MMM DD, YYYY'.
        time: str
            The time of the session in the format 'HH:MM AM/PM'.
        duration_minutes: int
            The duration of the session in minutes.
        on_time: bool
            Whether the session started on time, i.e., joined_at is within 2
            minutes of start_time. 
        completed: bool
            Whether the session was completed.
        session_title: str
            The title of the session.
    '''
    sessions = sessions.copy()

    sessions = sessions.sort_values('start_time', ascending=False)

    sessions['date'] = sessions['start_time'].dt.strftime(
        '%a, %b %d, %Y')
    sessions = sessions[sessions['start_time']
                        < pd.Timestamp.now()]

    if head:
        sessions = sessions.head(head)

    sessions['time'] = sessions['start_time'].dt.strftime('%I:%M %p')
    sessions['duration_minutes'] = sessions['duration'] / 60000
    sessions['on_time'] = (
        sessions['joined_at'] - sessions['start_time']) \
        <= pd.Timedelta(minutes=2)
    sessions['session_title'] = sessions['session_title'].replace(
        to_replace='^$|^None$', value='N/A', regex=True)

    sessions.drop(columns=['duration', 'requested_at',
                           'joined_at', 'start_time', 'partner_id'], inplace=True)

    return sessions.to_dict(orient='records')


def calc_duration_pie_data(sessions: pd.DataFrame):
    return [
        {
            "duration": "25m",
            "amount": len(sessions[sessions['duration'] == m_to_ms(25)])
        },
        {
            "duration": "50m",
            "amount": len(sessions[sessions['duration'] == m_to_ms(50)])
        },
        {
            "duration": "75m",
            "amount": len(sessions[sessions['duration'] == m_to_ms(75)])
        }
    ]


def calc_punctuality_pie_data(sessions: pd.DataFrame):
    sessions = sessions.copy()

    sessions.loc[:, 'join_start_diff'] = (
        sessions['joined_at'] - sessions['start_time']).dt.total_seconds()

    avg_join_start_diff = sessions['join_start_diff'].mean()
    median_join_start_diff = sessions['join_start_diff'].median()

    late_s = 60

    return {
        "data": [
            {
                "punctuality": "On time",
                "amount": len(sessions[sessions['join_start_diff'] <= late_s])
            },
            {
                "punctuality": "Late",
                "amount": len(sessions[sessions['join_start_diff'] > late_s])
            }
        ],
        "avg": format_seconds(avg_join_start_diff),
        "median": format_seconds(median_join_start_diff)
    }


def format_seconds(seconds: float) -> str:
    if pd.isna(seconds):
        return "N/A"

    seconds = round(seconds)
    punctuality = "early" if seconds <= 0 else "late"
    seconds = abs(seconds)

    if seconds <= 60:
        return f"{seconds}s {punctuality}"
    minutes = seconds // 60
    seconds = round(seconds % 60)
    return f"{minutes}m {seconds}s {punctuality}"


def calc_cumulative_sessions_chart(sessions: pd.DataFrame) -> List[Dict[str, Any]]:
    sessions = sessions.copy()

    # Extract the date part from start_time
    sessions['start_date'] = sessions['start_time'].dt.date

    # Pivot the DataFrame to have durations as columns
    pivot_df = pd.pivot_table(sessions,
                              index='start_date',
                              columns='duration',
                              aggfunc='size',
                              fill_value=0)
    pivot_df = pivot_df.reset_index()
    pivot_df.columns.name = None

    # Create a full date range
    full_date_range = pd.date_range(start=pivot_df['start_date'].min(),
                                    end=pivot_df['start_date'].max())

    # Reindex to include all dates in the range, filling missing dates with 0
    pivot_df = pivot_df.set_index('start_date').reindex(
        full_date_range, fill_value=0).reset_index()
    pivot_df.rename(columns={'index': 'start_date'}, inplace=True)

    # Format the start_date for display
    pivot_df['start_date'] = pd.to_datetime(
        pivot_df['start_date']).dt.strftime('%b %-d, %Y')

    # Calculate cumulative sum for each duration column
    for duration in pivot_df.columns[1:]:
        pivot_df[duration] = pivot_df[duration].cumsum()

    # rename the duration columns
    pivot_df.rename(columns={1500000: '25m',
                             3000000: '50m',
                             4500000: '75m'}, inplace=True)

    return pivot_df.to_dict(orient='records')


def calc_daily_record(sessions: pd.DataFrame) -> Dict[str, Any]:
    sessions = sessions.copy()
    sessions['start_date'] = sessions['start_time'].dt.date
    daily_duration = sessions.groupby('start_date')['duration'].sum()
    return {
        'date': daily_duration.idxmax().strftime('%b %-d, %Y'),
        'duration': ms_to_h(daily_duration.max())
    }
