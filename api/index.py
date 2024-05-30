from fastapi import FastAPI, Request
import os

app = FastAPI()


def get_session_id_from_cookie(request: Request):
    cookies = request.cookies
    session_id = cookies.get(os.getenv("SESSION_COOKIE_NAME"))
    return session_id


@app.get("/api/py/test")
async def test_endpoint(request: Request):
    session_id = get_session_id_from_cookie(request)
    return {"session_id": session_id}
