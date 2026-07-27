from api_utils.config import SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY
from supabase import create_client, Client

supabase_client: Client = create_client(
    SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY)


def update_daily_streak(user_id: str, daily_streak: int):
    """Update the daily streak of a user in the database and return True if the
    streak was updated, False otherwise.
    TODO: This function does not currently handle when the user's daily streak
    remains the same across different days. We should encode the date in the
    daily streak to handle this case."""
    prev_daily_streak = supabase_client.table("profile").select(
        "daily_streak").eq("user_id", user_id).execute().data[0]["daily_streak"]
    prev_daily_streak = prev_daily_streak or 0
    if daily_streak != prev_daily_streak and daily_streak > 0:
        supabase_client.table("profile").update(
            {"daily_streak": daily_streak}).eq("user_id", user_id).execute()
        # Report only a genuine increase. A broken streak picked back up drops
        # the stored value (10 -> 1), which still needs persisting, but the
        # client fires confetti off this flag and a reset is not a win.
        return daily_streak > prev_daily_streak
    return False


def _goal_payload(row: dict):
    """`weekly_goal` is a session count when the type is "sessions" and a
    number of minutes when it is "hours"."""
    return {
        "goal": row["weekly_goal"],
        "goal_type": row["weekly_goal_type"]
    }


def get_weekly_goal(user_id: str):
    response = supabase_client.table("profile").select(
        "weekly_goal, weekly_goal_type").eq("user_id", user_id).execute()
    return _goal_payload(response.data[0])


def update_weekly_goal(user_id: str, weekly_goal: int, goal_type: str):
    response = supabase_client.table("profile").update({
        "weekly_goal": weekly_goal,
        "weekly_goal_type": goal_type
    }).eq("user_id", user_id).execute()
    return _goal_payload(response.data[0])
