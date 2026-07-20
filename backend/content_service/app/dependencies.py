from typing import Optional

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.config import PUBLIC_KEY
from content_service.app.config import settings
from content_service.app.db import get_db

bearer_scheme = HTTPBearer(auto_error=False)

def decode_token(token: str) -> dict:
    """
    Декодирует и проверяет подпись JWT-токена, выпущенного auth_service.
    :param token: access-токен из заголовка Authorization
    :return: payload токена
    """
    return jwt.decode(token, PUBLIC_KEY, algorithms=[settings.jwt_algorithm])

def _decode_access_token(token: str) -> int:
    """
    Декодирует access-токен и достаёт из него id пользователя.
    :param token: сырой JWT-токен
    :return: id пользователя
    """
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не авторизован",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token истек")
    except jwt.InvalidTokenError:
        raise unauthorized

    if payload.get("type") != "access":
        raise unauthorized

    user_id = payload.get("sub")
    if user_id is None:
        raise unauthorized

    return int(user_id)


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> int:
    """
    FastAPI-зависимость: требует валидный Bearer access-токен и возвращает id пользователя.
    Используется на ручках, доступных любому авторизованному пользователю.
    :param credentials: заголовок Authorization, извлекается автоматически через HTTPBearer
    :return: id текущего пользователя
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не авторизован",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _decode_access_token(credentials.credentials)


async def require_room_master(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> int:
    """
    FastAPI-зависимость: требует, чтобы текущий пользователь был мастером указанной комнаты.
    Сначала проверяет валидность токена (через get_current_user_id), затем
    запрашивает у room_service список участников комнаты room_id, находит среди них мастера
    и сравнивает его id с id текущего пользователя.
    :param room_id: id комнаты, для которой проверяются права
    :param user_id: id текущего пользователя (из токена)
    :return: id пользователя (совпадает с id мастера комнаты)
    """
    async with httpx.AsyncClient(timeout=settings.room_service_timeout_seconds) as client:
        try:
            response = await client.get(f"{settings.room_service_url}/rooms/{room_id}/members")
        except httpx.RequestError:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Room service недоступен")

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комната не найдена")
    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Не удалось получить данные комнаты")

    allowed = any(
        member["user_id"] == user_id
        and member["role"] in {"master", "co_master"}
        for member in response.json()["items"]
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуются права мастера или со-мастера комнаты",
        )

    return user_id