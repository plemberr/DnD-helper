from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from room_service.app.config import PUBLIC_KEY, settings

bearer_scheme = HTTPBearer(auto_error=False)


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
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[settings.jwt_algorithm])
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


async def get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[int]:
    """
    FastAPI-зависимость: как get_current_user_id, но не требует авторизации.
    Используется на ручках, доступных и анонимным пользователям.
    :param credentials: заголовок Authorization, извлекается автоматически через HTTPBearer
    :return: id текущего пользователя или None, если токен не передан либо невалиден
    """
    if credentials is None:
        return None
    try:
        return _decode_access_token(credentials.credentials)
    except HTTPException:
        return None


async def get_bearer_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    """
    FastAPI-зависимость: возвращает сырой access-токен из заголовка Authorization.
    Нужен для проксирования запросов в auth_service (например, чтобы получить username).
    :param credentials: заголовок Authorization, извлекается автоматически через HTTPBearer
    :return: сырой access-токен
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не авторизован",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials
