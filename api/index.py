from fastapi import FastAPI, Security, HTTPException, Depends
from fastapi.security.api_key import APIKeyHeader
import os

app = FastAPI()

api_key_header = APIKeyHeader(name="CORS-API-Key")


async def validate_cors_api_key(incoming_cors_api_key: str = Security(api_key_header)):
    '''This function will be called before /api/py/secure-data endpoint is called
    to check if the API key is valid. If the API key is not valid, it will
    raise an HTTPException with status code 403.'''

    actual_cors_api_key = os.getenv("CORS_API_KEY")

    if incoming_cors_api_key != actual_cors_api_key:
        raise HTTPException(status_code=403, detail="Invalid API Key")

    return incoming_cors_api_key


@app.get("/api/py/secure-data", dependencies=[Depends(validate_cors_api_key)])
async def secure_data():
    return {"message": "You have access to this data"}


@app.get("/api/py/unsecure-data")
async def unsecure_data():
    return {"message": "This endpoint is public"}
