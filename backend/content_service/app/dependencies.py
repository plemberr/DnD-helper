from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app import security
from content_service.app.clients.room_client import fetch_room_master_id
from content_service.app.db import get_db

bearer_scheme = HTTPBearer(auto_error=False)


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
async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> int:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Не авторизован",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _decode_access_token(credentials.credentials)


# проверка, что пользователь — мастер комнаты room_id
async def require_room_master(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> int:
    master_id = await fetch_room_master_id(room_id)
    if master_id != user_id:
        raise HTTPException(status_code=403, detail="Требуются права мастера комнаты")
    return user_id