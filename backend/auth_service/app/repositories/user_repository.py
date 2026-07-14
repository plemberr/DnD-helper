from typing import Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.app import security
from auth_service.app.models import User


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """
    Возвращает пользователя по его id.
    :param db: сессия БД
    :param user_id: id пользователя
    :return: найденный пользователь или None, если не существует
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """
    Возвращает пользователя по имени пользователя.
    :param db: сессия БД
    :param username: имя пользователя
    :return: найденный пользователь или None, если не существует
    """
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Возвращает пользователя по email.
    :param db: сессия БД
    :param email: email пользователя
    :return: найденный пользователь или None, если не существует
    """
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_username_or_email(
    db: AsyncSession,
    login: str,
) -> Optional[User]:
    """
    Возвращает пользователя, у которого username или email совпадает с переданным логином.
    :param db: сессия БД
    :param login: username или email пользователя
    :return: найденный пользователь или None, если не существует
    """
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
    """
    Создаёт нового пользователя, хэшируя пароль перед сохранением.
    :param db: сессия БД
    :param username: имя пользователя
    :param email: email пользователя
    :param password: пароль в открытом виде
    :return: созданный пользователь
    """
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
    """
    Обновляет профиль пользователя, обновляются только переданные поля.
    :param db: сессия БД
    :param user: обновляемый пользователь
    :param username: новое имя пользователя (если None, то не изменяется)
    :param avatar_url: новая ссылка на аватар (если None, то не изменяется)
    :return: обновлённый пользователь
    """
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
    """
    Обновляет пароль пользователя (сохраняется хэш нового пароля).
    :param db: сессия БД
    :param user: пользователь, которому меняется пароль
    :param new_password: новый пароль в открытом виде
    :return: обновлённый пользователь
    """
    user.hashed_password = security.hash_password(new_password)

    await db.commit()
    await db.refresh(user)

    return user
