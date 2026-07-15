from typing import List

from fastapi import HTTPException, status

from character_service.app import schemas
from character_service.app.clients import room_client
from character_service.app.models import Character
from character_service.app.repositories import character_repository

# проверки доступа


async def require_room(room_id: int) -> None:
    """
    Проверяет, что комната существует
    :param room_id: id комнаты
    :return: ничего
    """
    await room_client.ensure_room_exists(room_id)


async def require_character(db, room_id: int, character_id: int) -> Character:
    """
    Возвращает персонажа из комнаты или бросает 404, если его там нет
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :return: найденный персонаж
    """
    character = await character_repository.get_character_in_room(db, room_id, character_id)
    if character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Персонаж не найден")
    return character


def require_owner(character: Character, user_id: int) -> bool:
    """
    Проверяет, является ли пользователь владельцем персонажа
    :param character: проверяемый персонаж
    :param user_id: id пользователя
    :return: True, если пользователь владелец, иначе False
    """
    return character.user_id == user_id


async def require_owner_or_master(character: Character, room_id: int, user_id: int) -> None:
    """
    Проверяет, что пользователь является владельцем персонажа либо мастером комнаты
    :param character: проверяемый персонаж
    :param room_id: id комнаты
    :param user_id: id пользователя
    :return: ничего
    """
    if character.user_id == user_id:
        return
    if await room_client.is_room_master(room_id, user_id):
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")


async def require_master(room_id: int, user_id: int) -> None:
    """
    Проверяет, что пользователь является мастером комнаты
    :param room_id: id комнаты
    :param user_id: id пользователя
    :return: ничего
    """
    if not await room_client.is_room_master(room_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")


# сериализация JSON-полей


def serialize_items(items: list) -> List[schemas.Item]:
    """Преобразует список JSON-объектов инвентаря/черт в схемы Item"""
    if not items:
        return []
    return [schemas.Item(**item) for item in items]


def serialize_spells(spells: dict) -> schemas.SpellsOut:
    """Преобразует JSON-поле spells персонажа в схему SpellsOut"""
    if not spells:
        return schemas.SpellsOut(ids=[])
    return schemas.SpellsOut(ids=spells.get("ids", []))
