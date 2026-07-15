from typing import List, Optional, Tuple

from fastapi import HTTPException, status

from character_service.app import schemas
from character_service.app.clients import room_client
from character_service.app.models import Character, CharacterSkills
from character_service.app.repositories import character_repository, character_skill_repository

# уровень навыка / модификатор владения
PROFICIENCY_BY_LEVEL = {0: 0, 1: 2, 2: 4}

# прирост hp_max за уровень
HP_PER_LEVEL = 5


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


def require_owner(character: Character, user_id: int) -> None:
    """
    Проверяет, что пользователь является владельцем персонажа
    :param character: проверяемый персонаж
    :param user_id: id пользователя
    :return: ничего
    """
    if character.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")


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

def _serialize_items(items: list) -> List[schemas.Item]:
    """Преобразует список JSON-объектов инвентаря/черт в схемы Item"""
    return [schemas.Item(**item) for item in (items or [])]


def _serialize_spells(spells: dict) -> schemas.SpellsOut:
    """Преобразует JSON-поле spells персонажа в схему SpellsOut"""
    return schemas.SpellsOut(ids=(spells or {}).get("ids", []))


def to_character_out(character: Character) -> schemas.CharacterOut:
    """
    Преобразует модель персонажа в полную схему ответа CharacterOut
    :param character: персонаж
    :return: схема CharacterOut
    """
    return schemas.CharacterOut(
        id=character.id,
        room_id=character.room_id,
        user_id=character.user_id,
        name=character.name,
        race=character.race,
        character_class=character.character_class,
        level=character.level,
        hp_current=character.hp_current,
        hp_max=character.hp_max,
        ac=character.ac,
        initiative=character.initiative,
        inspiration=character.inspiration,
        age=character.age,
        weight=character.weight,
        height=character.height,
        appearance=character.appearance,
        inventory=_serialize_items(character.inventory),
        feats=_serialize_items(character.feats),
        spells=_serialize_spells(character.spells),
        created_at=character.created_at,
        updated_at=character.updated_at,
    )


# создание персонажа

async def create_character(
    db, room_id: int, user_id: int, payload: schemas.CharacterCreate
) -> schemas.CharacterOut:
    """
    Создаёт нового персонажа в комнате
    :param db: сессия БД
    :param room_id: id комнаты
    :param user_id: id владельца персонажа
    :param payload: данные для создания персонажа
    :return: созданный персонаж (CharacterOut)
    """
    await require_room(room_id)

    character = await character_repository.create_character(
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
    return to_character_out(character)


# список персонажей комнаты

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
    items = [
        schemas.CharacterListItem(
            id=c.id,
            name=c.name,
            user_id=c.user_id,
            level=c.level,
            hp_current=c.hp_current,
            hp_max=c.hp_max,
            ac=c.ac,
        )
        for c in characters
    ]
    return items, total


# получение персонажа

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

    return schemas.CharacterDetail(
        id=character.id,
        user_id=character.user_id,
        name=character.name,
        race=character.race,
        character_class=character.character_class,
        level=character.level,
        hp_current=character.hp_current,
        hp_max=character.hp_max,
        ac=character.ac,
        initiative=character.initiative,
        inspiration=character.inspiration,
        age=character.age,
        weight=character.weight,
        height=character.height,
        appearance=character.appearance,
        skills=[schemas.SkillItem(skill_id=s.skill_id, level=s.level, value=s.value) for s in skills],
        inventory=_serialize_items(character.inventory),
        spells=_serialize_spells(character.spells),
        feats=_serialize_items(character.feats),
        created_at=character.created_at,
        updated_at=character.updated_at,
    )


# обновление персонажа

async def update_character(
    db, room_id: int, character_id: int, user_id: int, payload: schemas.CharacterUpdate
) -> Character:
    """
    Обновляет профиль персонажа (только переданные поля).
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
        age=payload.age,
        weight=payload.weight,
        height=payload.height,
        appearance=payload.appearance,
    )
    return character


# удаление персонажа

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


# заклинания

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
    require_owner(character, user_id)

    spells = dict(character.spells or {})
    ids = list(spells.get("ids", []))
    if spell_id not in ids:
        ids.append(spell_id)
    spells["ids"] = ids

    character.spells = spells
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
    return _serialize_spells(character.spells)


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
    require_owner(character, user_id)

    spells = dict(character.spells or {})
    ids = list(spells.get("ids", []))
    if spell_id not in ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заклинание не найдено")
    ids.remove(spell_id)
    spells["ids"] = ids

    character.spells = spells
    await character_repository.update_character(db, character)


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
    return _serialize_items(character.inventory)


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
    return _serialize_items(character.feats)


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
        skill = await character_skill_repository.create_skill(
            db, character_id=character.id, skill_id=skill_id, level=level, value=value
        )
    else:
        skill = await character_skill_repository.update_skill(db, skill, level=level, value=value)

    return skill


# lvl up / lvl down

async def level_up(db, room_id: int, character_id: int, user_id: int) -> Character:
    """
    Повышает уровень персонажа на 1, увеличивая hp_max и hp_current.
    Доступно только владельцу персонажа
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    require_owner(character, user_id)

    added_hp = HP_PER_LEVEL
    character.level += 1
    character.hp_max += added_hp
    character.hp_current += added_hp

    await character_repository.update_character(db, character)
    return character


async def level_down(db, character_id: int, user_id: int) -> Character:
    """
    Понижает уровень персонажа на 1, уменьшая hp_max (не ниже 1 уровня). Доступно только мастеру комнаты
    :param db: сессия БД
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :return: обновлённый персонаж
    """
    character = await character_repository.get_character_by_id(db, character_id)
    if character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Персонаж не найден")

    await require_master(character.room_id, user_id)

    if character.level <= 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя понизить уровень ниже 1")

    removed_hp = HP_PER_LEVEL
    character.level -= 1
    character.hp_max = max(1, character.hp_max - removed_hp)
    character.hp_current = min(character.hp_current, character.hp_max)

    await character_repository.update_character(db, character)
    return character


# HP

async def change_hp(db, room_id: int, character_id: int, user_id: int, delta: int) -> Character:
    """
    Изменяет текущее HP персонажа на delta, ограничивая результат диапазоном [0, hp_max]
    Доступно владельцу персонажа или мистеру комнаты.
    :param db: сессия БД
    :param room_id: id комнаты
    :param character_id: id персонажа
    :param user_id: id текущего пользователя
    :param delta: изменение HP (может быть отрицательным)
    :return: обновлённый персонаж
    """
    character = await require_character(db, room_id, character_id)
    await require_owner_or_master(character, room_id, user_id)

    new_hp = character.hp_current + delta
    new_hp = max(0, min(new_hp, character.hp_max))
    character.hp_current = new_hp

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
    require_owner(character, user_id)

    if character.inspiration <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нет доступного вдохновения")

    character.inspiration -= 1
    await character_repository.update_character(db, character)
    return character
