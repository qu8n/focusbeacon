from fastapi import FastAPI, Request
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import base64
import http.client

app = FastAPI()
load_dotenv()  # from .env file

supabase_project_url = os.getenv("SUPABASE_PROJECT_URL")
supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_client: Client = create_client(
    supabase_project_url, supabase_service_role_key)

# Configuration for AES encryption
algorithm = algorithms.AES
key_as_string = os.getenv("ENCRYPTION_KEY")
key_as_bytes = bytes.fromhex(key_as_string)
aes_iv = os.getenv("ENCRYPTION_AES_IV")
backend = default_backend()


def encrypt(text: str) -> str:
    iv = bytes.fromhex(aes_iv)

    cipher = Cipher(algorithm(key_as_bytes), modes.CBC(iv), backend=backend)
    encryptor = cipher.encryptor()

    padder = padding.PKCS7(algorithm.block_size).padder()
    padded_data = padder.update(text.encode('utf-8')) + padder.finalize()

    encrypted = encryptor.update(padded_data) + encryptor.finalize()

    return f"{base64.b64encode(iv).decode('utf-8')}:{base64.b64encode(encrypted).decode('utf-8')}"


def decrypt(encrypted_text: str) -> str:
    iv_text, encrypted = encrypted_text.split(":")
    iv = base64.b64decode(iv_text)
    encrypted_data = base64.b64decode(encrypted)

    cipher = Cipher(algorithm(key_as_bytes), modes.CBC(iv), backend=backend)
    decryptor = cipher.decryptor()

    decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()

    unpadder = padding.PKCS7(algorithm.block_size).unpadder()
    decrypted = unpadder.update(decrypted_padded) + unpadder.finalize()

    return decrypted.decode('utf-8')


def get_session_id_from_cookie(request: Request):
    cookies = request.cookies
    cookie_name = os.getenv("NEXT_PUBLIC_SESSION_COOKIE_NAME")
    session_id = cookies.get(cookie_name)
    return session_id


def get_access_token_from_db(session_id: str):
    response = supabase_client.table('profile').select(
        "accessTokenEncrypted").eq('sessionId', session_id).execute()
    access_token_encrypted = response.data[0]['accessTokenEncrypted']
    access_token = decrypt(access_token_encrypted)
    return access_token


@app.get("/api/py/profile")
async def profile(request: Request):
    session_id = get_session_id_from_cookie(request)
    access_token = get_access_token_from_db(session_id)
    data = fetch_focusmate_data("/v1/me", access_token)
    return {"data": data}

fm_api_domain = os.getenv("NEXT_PUBLIC_FM_API_DOMAIN")


def fetch_focusmate_data(endpoint, access_token):
    conn = http.client.HTTPSConnection("api.focusmate.com")
    headers = {'Authorization': 'Bearer ' + access_token}
    conn.request("GET", endpoint, headers=headers)
    response = conn.getresponse()
    data = response.read().decode("utf-8")
    conn.close()
    return data
