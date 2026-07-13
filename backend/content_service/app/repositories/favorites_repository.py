from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.models import Favorite, EntityType


async def create(db: AsyncSession, user_id: int, entity_type: EntityType, entity_id: int) -> Favorite:
    """
    Создаёт запись избранного для пользователя.
    :param db: сессия БД
    :param user_id: id пользователя, добавляющего запись в избранное
    :param entity_type: тип сущности (document/media)
    :param entity_id: id сущности, добавляемой в избранное
    :return: созданная запись Favorite
    """
    favorite = Favorite(user_id=user_id, entity_type=entity_type, entity_id=entity_id)
    db.add(favorite)
    await db.commit()
    await db.refresh(favorite)
    return favorite


async def get_by_id(db: AsyncSession, favorite_id: int) -> Favorite | None:
    """
    Возвращает запись избранного по её id.
    :param db: сессия БД
    :param favorite_id: id записи избранного
    :return: найденная запись Favorite или None, если не существует
    """
    return (await db.execute(select(Favorite).where(Favorite.id == favorite_id))).scalar_one_or_none()


async def list_by_user(db: AsyncSession, user_id: int, entity_type: EntityType | None = None) -> list[Favorite]:
    """
    Возвращает список избранного пользователя, отсортированный от новых к старым.
    :param db: сессия БД
    :param user_id: id пользователя, чьё избранное запрашивается
    :param entity_type: если передан, то вернуть только записи этого типа (document/media)
    :return: список записей Favorite
    """
    query = select(Favorite).where(Favorite.user_id == user_id)
    if entity_type is not None:
        query = query.where(Favorite.entity_type == entity_type)
    result = await db.execute(query.order_by(Favorite.created_at.desc()))
    return list(result.scalars().all())


async def delete(db: AsyncSession, favorite: Favorite) -> None:
    """
    Удаляет запись избранного.
    :param db: сессия БД
    :param favorite: удаляемая запись Favorite
    :return: ничего
    """
    await db.delete(favorite)
    await db.commit()