from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from character_service.app.config import PUBLIC_KEY, settings

bearer_scheme = HTTPBearer(auto_error=False)


def decode_token(token: str) -> dict:
    """
    Декодирует и проверяет подпись JWT-токена, выпущенного auth_service
    :param token: access-токен из заголовка Authorization
    :return: payload токена
    """
    return jwt.decode(token, PUBLIC_KEY, algorithms=[settings.jwt_algorithm])


def _decode_access_token(token: str) -> int:
    """
    Декодирует access-токен и достаёт из него id пользователя
    :param token: сырой JWT-токен
    :return: id пользователя
    """
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не авторизован",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
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
    Требует валидный Bearer access-токен и возвращает id пользователя.
    Используется на ручках, доступных любому авторизованному пользователю
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


async def get_bearer_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> str:
    """
    Требует валидный Bearer-токен и возвращает его значение
    (используется для запросов в room-service, чтобы проверить роль пользователя)
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
