from typing import Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.app import security
from auth_service.app.models import User


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_username_or_email(
    db: AsyncSession,
    login: str,
) -> Optional[User]:
    result = await db.execute(
        select(User).where(
            or_(
                User.username == login,
                User.email == login,
            )
        )
    )
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    username: str,
    email: str,
    password: str,
) -> User:
    user = User(
        username=username,
        email=email,
        hashed_password=security.hash_password(password),
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


async def update_user_profile(
    db: AsyncSession,
    user: User,
    username: Optional[str],
    avatar_url: Optional[str],
) -> User:
    if username is not None:
        user.username = username

    if avatar_url is not None:
        user.avatar_url = avatar_url

    await db.commit()
    await db.refresh(user)

    return user


async def update_user_password(
    db: AsyncSession,
    user: User,
    new_password: str,
) -> User:
    user.hashed_password = security.hash_password(new_password)

    await db.commit()
    await db.refresh(user)

    return user