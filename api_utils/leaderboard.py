import pandas as pd


def generate_rank(session_counts: str) -> list[dict]:
    '''
    Reads a CSV file from the given path containing userIds and their daily
    streaks, assigns a ranking value to each entry based on the streak value,
    and handles ties by assigning the same rank to entries with equal streaks.

    Returns:
        A list of dicts containing userIds, their daily streaks, and their
        assigned ranks, sorted in descending order based on streak values.
    '''

    columns = ['user_id', 'daily_streak']  # columns needed from csv

    df = pd.read_csv(session_counts, usecols=columns)

    # Convert dataframe to list of dicts
    list_of_streaks = df.to_dict(orient='records')

    # Sort by streak in descending order
    sorted_list_of_streaks = sorted(
        list_of_streaks, key=lambda x: x['daily_streak'], reverse=True)

    rank = 1
    skip_rank = 0  # counter for ties, determines following rank after a tie

    for i in range(len(sorted_list_of_streaks)):
        if (
            i == 0 or
            sorted_list_of_streaks[i]['daily_streak'] !=
                sorted_list_of_streaks[i-1]['daily_streak']
        ):
            rank += skip_rank
            skip_rank = 1
        else:
            skip_rank += 1

        sorted_list_of_streaks[i]['rank'] = rank

    return sorted_list_of_streaks
