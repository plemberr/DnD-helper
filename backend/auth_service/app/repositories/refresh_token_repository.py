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
    """Creates a DB record for a new refresh token and returns (record, raw_token)."""

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
    record.revoked_reason = reason

    if replaced_by is not None:
        record.replaced_by = replaced_by

    await db.commit()


async def revoke_all_active_refresh_tokens(
    db: AsyncSession,
    user_id: int,
    reason: str,
) -> None:
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_reason.is_(None),
        )
    )

    for record in result.scalars():
        record.revoked_reason = reason

    await db.commit()