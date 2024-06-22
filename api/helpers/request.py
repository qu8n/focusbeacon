from supabase import create_client, Client
from fastapi import Request
import os
from dotenv import load_dotenv
from api.helpers.crypto import decrypt

load_dotenv()

supabase_project_url = os.getenv("SUPABASE_PROJECT_URL")
supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_client: Client = create_client(
    supabase_project_url, supabase_service_role_key)


def get_session_id(request: Request):
    cookies = request.cookies
    cookie_name = os.getenv("NEXT_PUBLIC_SESSION_COOKIE_NAME")
    session_id = cookies.get(cookie_name)
    return session_id


def get_access_token(session_id: str):
    response = supabase_client.table('profile').select(
        "access_token_encrypted").eq('session_id', session_id).execute()
    access_token_encrypted = response.data[0]['access_token_encrypted']
    access_token = decrypt(access_token_encrypted)
    return access_token
