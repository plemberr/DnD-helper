from typing import List

from fastapi import HTTPException, status

from character_service.app import schemas
from character_service.app.models import Character
from character_service.app.repositories import character_repository
from character_service.app.services.common import (
    require_character,
    require_owner,
    require_owner_or_master,
    serialize_items,
    serialize_spells,
)

# инвентарь

async def set_inventory(
    db, room_id: int, character_id: int, user_id: int, items: List[schemas.Item]
) -> Character:
    """
    Заменяет инвентарь персонажа новым набором предметов.
    Доступно владельцу персонажа или мастеру комнаты
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param items: новый список предметов инвентаря
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    await require_owner_or_master(character, room_id, user_id)

    character.inventory = [item.model_dump() for item in items]
    await character_repository.update_character(db, character)
    return character


async def get_inventory(db, room_id: int, character_id: int) -> List[schemas.Item]:
    """
    Возвращает инвентарь персонажа
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :return: список предметов инвентаря
    """
    character = await require_character(db, room_id, character_id)
    return serialize_items(character.inventory)


# черты

async def set_feats(
    db, room_id: int, character_id: int, user_id: int, feats: List[schemas.Item]
) -> Character:
    """
    Заменяет черты персонажа новым набором.
    Доступно владельцу персонажа или мастеру комнаты
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param feats: новый список черт
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    await require_owner_or_master(character, room_id, user_id)

    character.feats = [item.model_dump() for item in feats]
    await character_repository.update_character(db, character)
    return character


async def get_feats(db, room_id: int, character_id: int) -> List[schemas.Item]:
    """
    Возвращает черты персонажа
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :return: список черт
    """
    character = await require_character(db, room_id, character_id)
    return serialize_items(character.feats)


# заклинания

def _set_spells(character: Character, ids: list) -> None:
    """
    Сеттер JSON-поля spells персонажа
    :param character: персонаж
    :param ids: новый список id заклинаний
    :return: ничего
    """
    character.spells = {"ids": ids}


async def add_spell(db, room_id: int, character_id: int, user_id: int, spell_id: str) -> Character:
    """
    Добавляет заклинание персонажу. Доступно только владельцу персонажа
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param spell_id: id добавляемого заклинания
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    if not require_owner(character, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")

    ids = list((character.spells or {}).get("ids", []))
    if spell_id not in ids:
        ids.append(spell_id)
    _set_spells(character, ids)

    await character_repository.update_character(db, character)
    return character


async def get_spells(db, room_id: int, character_id: int) -> schemas.SpellsOut:
    """
    Возвращает список известных персонажу заклинаний
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :return: список заклинаний (SpellsOut)
    """
    character = await require_character(db, room_id, character_id)
    return serialize_spells(character.spells)


async def remove_spell(db, room_id: int, character_id: int, user_id: int, spell_id: str) -> None:
    """
    Удаляет заклинание у персонажа. Доступно только владельцу персонажа
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param spell_id: id удаляемого заклинания
    :return: ничего
    """
    character = await require_character(db, room_id, character_id)
    if not require_owner(character, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")

    ids = list((character.spells or {}).get("ids", []))
    if spell_id not in ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заклинание не найдено")
    ids.remove(spell_id)
    _set_spells(character, ids)

    await character_repository.update_character(db, character)
