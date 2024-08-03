from api_utils.config import SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY
from supabase import create_client, Client

supabase_client: Client = create_client(
    SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY)


def update_daily_streak(user_id: str, daily_streak: int):
    supabase_client.table("profile").update(
        {"daily_streak": daily_streak}).eq("user_id", user_id).execute()


def get_weekly_goal(user_id: str):
    response = supabase_client.table("profile").select(
        "weekly_goal").eq("user_id", user_id).execute()
    return response.data[0]["weekly_goal"]
