from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.app import security
from auth_service.app.config import settings
from auth_service.app.models import RefreshToken


async def create_refresh_token_record(
    db: AsyncSession,
    user_id: int,
) -> tuple[RefreshToken, str]:
    """
    Создаёт запись в БД для нового refresh-токена.
    :param db: сессия БД
    :param user_id: id пользователя, которому выдаётся токен
    :return: запись refresh-токена, сырой токен для отправки клиенту
    """
    raw_token, token_hash = security.generate_refresh_token()

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=settings.refresh_token_expire_days)
    )

    record = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    db.add(record)
    await db.commit()
    await db.refresh(record)

    return record, raw_token


async def get_refresh_token_by_raw(
    db: AsyncSession,
    raw_token: str,
) -> Optional[RefreshToken]:
    """
    Находит запись refresh-токена по его сырому значению (хэширует и ищет по хэшу).
    :param db: сессия БД
    :param raw_token: сырой refresh-токен, полученный от клиента
    :return: найденная запись или None, если токен неизвестен
    """
    token_hash = security.hash_refresh_token(raw_token)

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash
        )
    )

    return result.scalar_one_or_none()


async def revoke_refresh_token(
    db: AsyncSession,
    record: RefreshToken,
    reason: str,
    replaced_by: Optional[int] = None,
) -> None:
    """
    Отзывает refresh-токен, помечая причину отзыва.
    :param db: сессия БД
    :param record: отзываемая запись refresh-токена
    :param reason: причина отзыва (logout, rotated, reuse_detected, password_changed)
    :param replaced_by: id токена, который заменил данный
    :return: ничего
    """
    record.revoked_reason = reason

    if replaced_by is not None:
        record.replaced_by = replaced_by

    await db.commit()


async def revoke_all_active_refresh_tokens(
    db: AsyncSession,
    user_id: int,
    reason: str,
) -> None:
    """
    Отзывает все активные (ещё не отозванные) refresh-токены пользователя.
    Используется при смене пароля и при обнаружении повторного использования токена.
    :param db: сессия БД
    :param user_id: id пользователя, чьи токены отзываются
    :param reason: причина отзыва
    :return: ничего
    """
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_reason.is_(None),
        )
    )

    for record in result.scalars():
        record.revoked_reason = reason

    await db.commit()
