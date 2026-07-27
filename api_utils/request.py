from fastapi import Request
from api_utils.config import SESSION_COOKIE_NAME
from api_utils.encryption import decrypt
from api_utils.supabase import supabase_client


def get_session_id(request: Request):
    cookies = request.cookies
    session_id = cookies.get(SESSION_COOKIE_NAME)
    return session_id


class SessionNotFound(Exception):
    """No usable session behind the presented ID -- it was never valid, or
    sign-out revoked it. Distinct from a Supabase or network failure, which
    must not be reported to the user as an invalid session."""


def get_access_token(session_id: str):
    response = supabase_client.table('profile').select(
        "access_token_encrypted").eq('session_id', session_id).execute()

    if not response.data or 'access_token_encrypted' not in response.data[0]:
        raise SessionNotFound("No profile row matches this session ID")

    access_token_encrypted = response.data[0]['access_token_encrypted']
    try:
        return decrypt(access_token_encrypted)
    except Exception as e:
        # Ciphertext we can no longer read (after a key rotation, say) is dead
        # for this session, but signing in again re-encrypts under the current
        # key -- so send the user back to sign-in rather than raising a 500
        raise SessionNotFound(
            f"Stored access token could not be decrypted: {e}")
