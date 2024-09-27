import pandas as pd

def extract_user_streaks(session_counts):
    '''
    Converts the pandas dataframe into a list of dictionaries containing data needed for ranking algorithm

    [{user_id: xxx, daily_streak: xxx}, {...}]
    '''

    columns = ['user_id', 'daily_streak']
    df = pd.read_csv(session_counts, usecols=columns)
    list_of_streaks = df.to_dict(orient='records')

    return list_of_streaks

def generate_rank(list_of_streaks):
    '''
    Takes a list of dicts containing userIDs and their streaks, and generates a ranking value for each entry based on
    streak value. Returns the list sorted in non-descending order based on ranking.

    return: [{user_id: xxx, daily_streak: xxx, rank: xxx}, {...}]
    '''
    sorted_list_of_streaks = sorted(list_of_streaks, key=lambda x: x['daily_streak'], reverse=True)

    # initialize ranking vars
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

# output1 = extract_user_streaks('profile_rows.csv')
# output2 = generate_rank(output1)
#
# print(type(output1))
# print(output2)