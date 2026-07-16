from typing import Optional, Sequence, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from character_service.app.models import Character


async def create_character(db: AsyncSession, room_id: int, user_id: int, **fields) -> Character:
    """
    Создаёт нового персонажа
    :param db: сессия БД
    :param room_id: id комнаты, в которой создаётся персонаж
    :param user_id: id владельца персонажа
    :param fields: остальные поля персонажа (name, race, character_class, hp_current и т.д.)
    :return: созданный персонаж
    """
    character = Character(room_id=room_id, user_id=user_id, **fields)
    db.add(character)
    await db.commit()
    await db.refresh(character)
    return character


async def get_character_by_id(db: AsyncSession, character_id: int) -> Optional[Character]:
    """
    Возвращает персонажа по его id
    :param db: сессия БД
    :param character_id: id персонажа
    :return: найденный персонаж или None, если не существует
    """
    result = await db.execute(select(Character).where(Character.id == character_id))
    return result.scalar_one_or_none()


async def get_character_in_room(db: AsyncSession, room_id: int, character_id: int) -> Optional[Character]:
    """
    Возвращает персонажа по id, только если он принадлежит указанной комнате
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :return: найденный персонаж или None, если не существует в этой комнате
    """
    result = await db.execute(
        select(Character).where(Character.id == character_id, Character.room_id == room_id)
    )
    return result.scalar_one_or_none()


async def list_characters(
    db: AsyncSession, room_id: int, user_id: Optional[int] = None
) -> Tuple[Sequence[Character], int]:
    """
    Возвращает список персонажей комнаты с возможной фильтрацией по владельцу
    :param db: сессия БД
    :param room_id: id комнаты
    :param user_id: если указан, возвращаются только персонажи этого пользователя
    :return: список персонажей и их общее количество
    """
    query = select(Character).where(Character.room_id == room_id)
    if user_id is not None:
        query = query.where(Character.user_id == user_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.order_by(Character.created_at.asc())
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def update_character(db: AsyncSession, character: Character, **fields) -> Character:
    """
    Обновляет переданные поля персонажа (None-значения игнорируются)
    :param db: сессия БД
    :param character: обновляемый персонаж
    :param fields: обновляемые поля и их новые значения
    :return: обновлённый персонаж
    """
    for key, value in fields.items():
        if value is not None:
            setattr(character, key, value)

    await db.commit()
    await db.refresh(character)
    return character


async def delete_character(db: AsyncSession, character: Character) -> None:
    """
    Удаляет персонажа
    :param db: сессия БД
    :param character: удаляемый персонаж
    :return: ничего
    """
    await db.delete(character)
    await db.commit()
