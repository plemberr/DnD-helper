from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.app import schemas, security
from auth_service.app.db import get_db
from auth_service.app.dependencies import get_current_user
from auth_service.app.models import User
from auth_service.app.repositories import user_repository, refresh_token_repository
from auth_service.app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    if await user_repository.get_user_by_username(db, payload.username):
        raise HTTPException(status_code=409, detail="Имя пользователя уже используется")
    if await user_repository.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Email уже зарегистрирован")

    try:
        user = await user_repository.create_user(db, payload.username, payload.email, payload.password)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Имя пользователя или email уже используются")

    return await auth_service.issue_tokens(db, user)


@router.post("/login", response_model=schemas.TokenResponse)
async def login(payload: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await user_repository.get_user_by_username_or_email(db, payload.login)
    if not user or not security.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Некорректный логин или пароль")

    return await auth_service.issue_tokens(db, user)


@router.post("/refresh", response_model=schemas.RefreshResponse)
async def refresh(payload: schemas.RefreshRequest, db: AsyncSession = Depends(get_db)):
    invalid = HTTPException(status_code=401, detail="Refresh token некорректен или отозван")

    record = await refresh_token_repository.get_refresh_token_by_raw(db, payload.refresh_token)
    if record is None:
        raise invalid

    if record.revoked_reason is not None:
        await refresh_token_repository.revoke_all_active_refresh_tokens(db, record.user_id, reason="reuse_detected")
        raise invalid

    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token истек")

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
    record = await refresh_token_repository.get_refresh_token_by_raw(db, payload.refresh_token)
    if record and record.user_id == current_user.id and record.revoked_reason is None:
        await refresh_token_repository.revoke_refresh_token(db, record, reason="logout")
    return


@router.get("/me", response_model=schemas.UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
async def update_me(
    payload: schemas.UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.username and payload.username != current_user.username:
        existing = await user_repository.get_user_by_username(db, payload.username)
        if existing is not None:
            raise HTTPException(status_code=409, detail="Имя пользователя уже занято")

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
    if not security.verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Старый пароль некорректен")

    await user_repository.update_user_password(db, current_user, payload.new_password)
    await refresh_token_repository.revoke_all_active_refresh_tokens(db, current_user.id, reason="password_changed")
    return
