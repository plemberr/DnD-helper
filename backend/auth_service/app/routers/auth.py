from datetime import datetime, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.app import schemas, security
from auth_service.app.db import get_db
from auth_service.app.models import User
from auth_service.app.repositories import user_repository, refresh_token_repository

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI-зависимость: проверяет access-токен из заголовка Authorization и
    возвращает соответствующего пользователя из БД.
    :param credentials: заголовок Authorization, извлекается автоматически через HTTPBearer
    :param db: сессия БД
    :return: текущий пользователь
    """
    token = credentials.credentials
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не авторизован",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = security.decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token истек")
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


async def _issue_tokens(db: AsyncSession, user: User) -> schemas.TokenResponse:
    """
    Создаёт пару access/refresh токенов для пользователя и сохраняет refresh-токен в БД.
    :param db: сессия БД
    :param user: пользователь, для которого выпускаются токены
    :return: access-токен, refresh-токен и данные пользователя (TokenResponse)
    """
    access_token, expires_in = security.create_access_token(user.id)

    _, refresh_token = await refresh_token_repository.create_refresh_token_record(db, user.id)

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=schemas.UserPublic.model_validate(user),
    )


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Регистрирует нового пользователя и выдаёт ему пару токенов.
    :param payload: данные для регистрации (username, email, password)
    :param db: сессия БД
    :return: пара токенов и данные пользователя (TokenResponse)
    """
    if await user_repository.get_user_by_username(db, payload.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Имя пользователя уже используется")
    if await user_repository.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email уже зарегистрирован")

    try:
        user = await user_repository.create_user(db, payload.username, payload.email, payload.password)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Имя пользователя или email уже используются")

    return await _issue_tokens(db, user)


@router.post("/login", response_model=schemas.TokenResponse)
async def login(payload: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Аутентифицирует пользователя по логину (username или email) и паролю, выдаёт пару токенов.
    :param payload: логин и пароль
    :param db: сессия БД
    :return: пара токенов и данные пользователя (TokenResponse)
    """
    user = await user_repository.get_user_by_username_or_email(db, payload.login)
    if not user or not security.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Некорректный логин или пароль")

    return await _issue_tokens(db, user)


@router.post("/refresh", response_model=schemas.RefreshResponse)
async def refresh(payload: schemas.RefreshRequest, db: AsyncSession = Depends(get_db)):
    """
    Обновляет пару токенов по refresh-токену (с ротацией: старый токен отзывается).
    Если предъявлен уже отозванный токен, отзывает все активные токены пользователя
    (защита от повторного использования украденного refresh-токена).
    :param payload: refresh-токен клиента
    :param db: сессия БД
    :return: новая пара токенов (RefreshResponse)
    """
    invalid = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token некорректен или отозван")

    record = await refresh_token_repository.get_refresh_token_by_raw(db, payload.refresh_token)
    if record is None:
        raise invalid

    if record.revoked_reason is not None:
        await refresh_token_repository.revoke_all_active_refresh_tokens(db, record.user_id, reason="reuse_detected")
        raise invalid

    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token истек")

    user = await user_repository.get_user_by_id(db, record.user_id)
    if user is None:
        raise invalid

    new_record, new_refresh_token = await refresh_token_repository.create_refresh_token_record(db, user.id)
    await refresh_token_repository.revoke_refresh_token(db, record, reason="rotated", replaced_by=new_record.id)

    access_token, expires_in = security.create_access_token(user.id)

    return schemas.RefreshResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=expires_in,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    payload: schemas.LogoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Отзывает конкретный refresh-токен текущего пользователя (выход из системы).
    :param payload: refresh-токен, который нужно отозвать
    :param current_user: текущий пользователь (из access-токена)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    record = await refresh_token_repository.get_refresh_token_by_raw(db, payload.refresh_token)
    if record and record.user_id == current_user.id and record.revoked_reason is None:
        await refresh_token_repository.revoke_refresh_token(db, record, reason="logout")
    return


@router.get("/me", response_model=schemas.UserOut)
async def me(current_user: User = Depends(get_current_user)):
    """
    Возвращает данные текущего авторизованного пользователя.
    :param current_user: текущий пользователь (из access-токена)
    :return: данные пользователя (UserOut)
    """
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
async def update_me(
    payload: schemas.UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновляет профиль текущего пользователя (обновляются только переданные поля).
    :param payload: новые username и/или avatar_url
    :param current_user: текущий пользователь (из access-токена)
    :param db: сессия БД
    :return: обновлённые данные пользователя (UserOut)
    """
    if payload.username and payload.username != current_user.username:
        existing = await user_repository.get_user_by_username(db, payload.username)
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Имя пользователя уже занято")

    updated = await user_repository.update_user_profile(
        db, current_user, payload.username, payload.avatar_url
    )
    return updated


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: schemas.ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Меняет пароль текущего пользователя и отзывает все его активные refresh-токены,
    вынуждая заново авторизоваться на всех устройствах.
    :param payload: старый и новый пароль
    :param current_user: текущий пользователь (из access-токена)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    if not security.verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Старый пароль некорректен")

    await user_repository.update_user_password(db, current_user, payload.new_password)
    await refresh_token_repository.revoke_all_active_refresh_tokens(db, current_user.id, reason="password_changed")
    return