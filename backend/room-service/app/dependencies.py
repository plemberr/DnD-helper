from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app import security

bearer_scheme = HTTPBearer(auto_error=False)


# декодирование токена
def _decode_access_token(token: str) -> int:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не авторизован",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = security.decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access token истек")
    except jwt.InvalidTokenError:
        raise unauthorized

    if payload.get("type") != "access":
        raise unauthorized

    user_id = payload.get("sub")
    if user_id is None:
        raise unauthorized

    return int(user_id)


# обязательная авторизация
async def get_current_user_id( credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> int:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Не авторизован",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _decode_access_token(credentials.credentials)


# необязательная авторизация
async def get_optional_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> Optional[int]:
    if credentials is None:
        return None
    try:
        return _decode_access_token(credentials.credentials)
    except HTTPException:
        return None


# access токен, для отправки в auth, чтобы получить username
async def get_bearer_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Не авторизован",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials
