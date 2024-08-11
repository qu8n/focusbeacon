from fastapi import Request
from api_utils.config import SESSION_COOKIE_NAME
from api_utils.encryption import decrypt
from api_utils.supabase import supabase_client


def get_session_id(request: Request):
    cookies = request.cookies
    session_id = cookies.get(SESSION_COOKIE_NAME)
    return session_id


def get_access_token(session_id: str):
    response = supabase_client.table('profile').select(
        "access_token_encrypted").eq('session_id', session_id).execute()

    if not response.data or 'access_token_encrypted' not in response.data[0]:
        raise Exception("Access token not found for the given session ID")

    access_token_encrypted = response.data[0]['access_token_encrypted']
    access_token = decrypt(access_token_encrypted)
    return access_token
