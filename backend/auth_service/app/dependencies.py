import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.app import security
from auth_service.app.db import get_db
from auth_service.app.models import User
from auth_service.app.repositories import user_repository

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
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

    user = await user_repository.get_user_by_id(db, int(user_id))
    if user is None:
        raise unauthorized

    return user
