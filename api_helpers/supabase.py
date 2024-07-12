from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_project_url = os.getenv("SUPABASE_PROJECT_URL")
supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_client: Client = create_client(
    supabase_project_url, supabase_service_role_key)


def update_daily_streak(user_id: str, daily_streak: int):
    supabase_client.table("profile").update(
        {"daily_streak": daily_streak}).eq("user_id", user_id).execute()
