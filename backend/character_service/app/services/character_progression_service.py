from typing import List, Tuple

from fastapi import HTTPException, status

from character_service.app import schemas
from character_service.app.models import Character, CharacterSkills
from character_service.app.repositories import character_repository, character_skill_repository
from character_service.app.services.common import (
    require_character,
    require_master,
    require_owner,
    require_owner_or_master,
)

# уровень навыка / модификатор владения
PROFICIENCY_BY_LEVEL = {0: 0, 1: 2, 2: 4}

# навыки

async def list_skills(db, room_id: int, character_id: int) -> Tuple[List[schemas.SkillItem], int]:
    """
    Возвращает список навыков персонажа
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :return: список навыков (SkillItem) и их общее количество
    """
    character = await require_character(db, room_id, character_id)
    skills, total = await character_skill_repository.list_skills(db, character.id)
    items = [schemas.SkillItem(skill_id=s.skill_id, level=s.level, value=s.value) for s in skills]
    return items, total


async def update_skill(
    db, room_id: int, character_id: int, user_id: int, skill_id: int, level: int
) -> CharacterSkills:
    """
    Обновляет уровень владения навыком персонажа.
    Доступно владельцу персонажа или мастеру комнаты
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param skill_id: id навыка
    :param level: новый уровень владения навыком (0, 1 или 2)
    :return: обновлённая или созданная запись навыка
    """
    character = await require_character(db, room_id, character_id)
    await require_owner_or_master(character, room_id, user_id)

    value = PROFICIENCY_BY_LEVEL.get(level, 0)

    skill = await character_skill_repository.get_skill(db, character.id, skill_id)
    if skill is None:
        return await character_skill_repository.create_skill(
            db, character_id=character.id, skill_id=skill_id, level=level, value=value
        )

    if skill.level == level:
        return skill

    return await character_skill_repository.update_skill(db, skill, level=level, value=value)


# HP

async def change_hp(db, room_id: int, character_id: int, user_id: int, delta: int) -> Character:
    """
    Изменяет текущее HP персонажа на delta.
    HP ограничивается сверху значением hp_max, но может уходить ниже нуля
    Доступно владельцу персонажа или мастеру комнаты.
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param delta: изменение HP (может быть отрицательным)
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    await require_owner_or_master(character, room_id, user_id)

    character.hp_current = min(character.hp_current + delta, character.hp_max)

    await character_repository.update_character(db, character)
    return character

# вдохновение

async def grant_inspiration(db, room_id: int, character_id: int, user_id: int, amount: int) -> Character:
    """
    Начисляет персонажу очки вдохновения. Доступно только мастеру комнаты
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param amount: количество начисляемых очков
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    await require_master(room_id, user_id)

    character.inspiration += amount
    await character_repository.update_character(db, character)
    return character


async def use_inspiration(db, room_id: int, character_id: int, user_id: int) -> Character:
    """
    Тратит одно очко вдохновения персонажа. Доступно только владельцу персонажа
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    if not require_owner(character, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")

    if character.inspiration <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нет доступного вдохновения")

    character.inspiration -= 1
    await character_repository.update_character(db, character)
    return character
