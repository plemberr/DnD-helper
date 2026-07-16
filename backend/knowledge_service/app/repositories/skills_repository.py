from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from knowledge_service.app.models import Skill, Type


async def list_skills(
    db: AsyncSession,
    type: Type | None = None,
    parent_id: int | None = None,
    filter_parent: bool = False,
) -> list[Skill]:
    """
    Возвращает список навыков из справочника, отсортированный по order_index.
    :param db: сессия БД
    :param type: если указан, фильтрует навыки по типу (ability/saving_throw/skill)
    :param parent_id: id родительского навыка для фильтрации дочерних записей
    :param filter_parent: если True, применяется фильтр по parent_id (в том числе по None)
    :return: список найденных навыков
    """
    query = select(Skill)
    if type is not None:
        query = query.where(Skill.type == type)
    if filter_parent:
        query = query.where(Skill.parent_id == parent_id)
    result = await db.execute(query.order_by(Skill.order_index))
    return list(result.scalars().all())  # достать именно объекты Skill и получить список


async def get_by_id(db: AsyncSession, skill_id: int) -> Skill | None:
    """
    Возвращает навык по его id.
    :param db: сессия БД
    :param skill_id: id навыка
    :return: найденный навык или None, если он не существует
    """
    return (await db.execute(select(Skill).where(Skill.id == skill_id))).scalar_one_or_none()
