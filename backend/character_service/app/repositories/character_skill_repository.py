from typing import Optional, Sequence, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from character_service.app.models import CharacterSkills


async def list_skills(db: AsyncSession, character_id: int) -> Tuple[Sequence[CharacterSkills], int]:
    """
    Возвращает список навыков персонажа
    :param db: сессия БД
    :param character_id: id персонажа
    :return: список записей навыков и их общее количество
    """
    query = select(CharacterSkills).where(CharacterSkills.character_id == character_id)

    total = await db.scalar(select(func.count()).select_from(query.subquery()))

    query = query.order_by(CharacterSkills.skill_id.asc())
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_skill(db: AsyncSession, character_id: int, skill_id: int) -> Optional[CharacterSkills]:
    """
    Возвращает конкретный навык персонажа
    :param db: сессия БД
    :param character_id: id персонажа
    :param skill_id: id навыка
    :return: найденная запись навыка или None, если персонаж им не владеет
    """
    result = await db.execute(
        select(CharacterSkills).where(
            CharacterSkills.character_id == character_id,
            CharacterSkills.skill_id == skill_id,
        )
    )
    return result.scalar_one_or_none()


async def create_skill(
    db: AsyncSession, character_id: int, skill_id: int, level: int, value: int
) -> CharacterSkills:
    """
    Создаёт запись владения навыком у персонажа
    :param db: сессия БД
    :param character_id: id персонажа
    :param skill_id: id навыка
    :param level: уровень владения навыком (0, 1 или 2)
    :param value: итоговое значение модификатора навыка
    :return: созданная запись навыка
    """
    skill = CharacterSkills(character_id=character_id, skill_id=skill_id, level=level, value=value)
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill


async def update_skill(db: AsyncSession, skill: CharacterSkills, level: int, value: int) -> CharacterSkills:
    """
    Обновляет уровень и значение уже существующей записи навыка
    :param db: сессия БД
    :param skill: обновляемая запись навыка
    :param level: новый уровень владения навыком
    :param value: новое значение модификатора навыка
    :return: обновлённая запись навыка
    """
    skill.level = level
    skill.value = value
    await db.commit()
    await db.refresh(skill)
    return skill
