import pandas as pd

def generate_rank(session_counts):
    '''
    Takes a list of dicts containing userIDs and their streaks, and generates a ranking value for each entry based on
    streak value. Returns the list sorted in non-descending order based on ranking.

    return: [{user_id: xxx, daily_streak: xxx, rank: xxx}, {...}]
    '''

    columns = ['user_id', 'daily_streak']   # columns needed from csv
    df = pd.read_csv(session_counts, usecols=columns)   # extract data from csv to dataframe
    list_of_streaks = df.to_dict(orient='records')  # convert data fram to list of dicts
    sorted_list_of_streaks = sorted(list_of_streaks, key=lambda x: x['daily_streak'], reverse=True) # sort by streak

    rank = 1
    skip_rank = 0   # counter for ties, used to determine following rank after a tie

    for i in range(len(sorted_list_of_streaks)):
        if i == 0 or sorted_list_of_streaks[i]['daily_streak'] != sorted_list_of_streaks[i-1]['daily_streak']:
            rank += skip_rank
            skip_rank = 1
        else:
            skip_rank += 1

        sorted_list_of_streaks[i]['rank'] = rank

    return sorted_list_of_streaks
