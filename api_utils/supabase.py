from api_utils.config import SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY
from supabase import create_client, Client

supabase_client: Client = create_client(
    SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY)


def update_daily_streak(user_id: str, daily_streak: int):
    prev_daily_streak = supabase_client.table("profile").select(
        "daily_streak").eq("user_id", user_id).execute().data[0]["daily_streak"]
    if daily_streak > prev_daily_streak:
        supabase_client.table("profile").update(
            {"daily_streak": daily_streak}).eq("user_id", user_id).execute()
        return True
    return False


def get_weekly_goal(user_id: str):
    response = supabase_client.table("profile").select(
        "weekly_goal").eq("user_id", user_id).execute()
    return response.data[0]["weekly_goal"]


def update_weekly_goal(user_id: str, weekly_goal: int):
    response = supabase_client.table("profile").update(
        {"weekly_goal": weekly_goal}).eq("user_id", user_id).execute()
    return response.data[0]["weekly_goal"]
