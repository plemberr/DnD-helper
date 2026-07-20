from typing import List, Optional, Tuple

from character_service.app import schemas
from character_service.app.models import Character
from character_service.app.repositories import character_repository, character_skill_repository
from character_service.app.services.common import require_character, require_owner_or_master, require_room

# персонаж


async def create_character(
    db, room_id: int, user_id: int, payload: schemas.CharacterCreate
) -> Character:
    """
    Создаёт нового персонажа в комнате.
    Возвращает саму ORM-модель — преобразование в CharacterOut делает FastAPI
    через response_model (у схемы включён from_attributes), переписывать поля вручную не нужно.
    :param db: сессия БД
    :param room_id: id комнаты
    :param user_id: id владельца персонажа
    :param payload: данные для создания персонажа
    :return: созданный персонаж
    """
    await require_room(room_id)

    return await character_repository.create_character(
        db,
        room_id=room_id,
        user_id=user_id,
        name=payload.name,
        race=payload.race,
        character_class=payload.character_class,
        level=payload.level,
        age=payload.age,
        weight=payload.weight,
        height=payload.height,
        appearance=payload.appearance,
        hp_current=payload.hp_current,
        hp_max=payload.hp_max,
        ac=payload.ac,
        initiative=payload.initiative,
    )


async def list_characters(
    db, room_id: int, user_id: Optional[int]
) -> Tuple[List[schemas.CharacterListItem], int]:
    """
    Возвращает список персонажей комнаты с возможной фильтрацией по владельцу
    :param db: сессия БД
    :param room_id: id комнаты
    :param user_id: если указан, возвращаются только персонажи этого пользователя
    :return: список персонажей (CharacterListItem) и их общее количество
    """
    await require_room(room_id)

    characters, total = await character_repository.list_characters(db, room_id, user_id)
    items = [schemas.CharacterListItem.model_validate(c) for c in characters]
    return items, total


async def get_character_detail(db, room_id: int, character_id: int) -> schemas.CharacterDetail:
    """
    Возвращает детальную информацию о персонаже, включая навыки
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :return: детальный персонаж (CharacterDetail)
    """
    character = await require_character(db, room_id, character_id)
    skills, _ = await character_skill_repository.list_skills(db, character.id)

    # CharacterDetail = CharacterOut + skills, поэтому персонаж собирается напрямую из ORM-модели,
    # вручную переносить остальные поля не требуется
    detail = schemas.CharacterDetail.model_validate(character)
    detail.skills = [schemas.SkillItem.model_validate(s) for s in skills]
    return detail


async def update_character(
    db, room_id: int, character_id: int, user_id: int, payload: schemas.CharacterUpdate
) -> Character:
    """
    Обновляет профиль персонажа (только переданные поля, включая level).
    Доступно владельцу персонажа или мастеру комнаты
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param payload: новые значения полей персонажа
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    await require_owner_or_master(character, room_id, user_id)

    character = await character_repository.update_character(
        db,
        character,
        name=payload.name,
        race=payload.race,
        character_class=payload.character_class,
        level=payload.level,
        age=payload.age,
        weight=payload.weight,
        height=payload.height,
        appearance=payload.appearance,
    )
    return character


async def delete_character(db, room_id: int, character_id: int, user_id: int) -> None:
    """
    Удаляет персонажа. Доступно владельцу персонажа или мастеру комнаты
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :return: ничего
    """
    character = await require_character(db, room_id, character_id)
    await require_owner_or_master(character, room_id, user_id)

    await character_repository.delete_character(db, character)
