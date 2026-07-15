from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from knowledge_service.app import schemas
from knowledge_service.app.db import get_db
from knowledge_service.app.models import Type
from knowledge_service.app.repositories import skills_repository

router = APIRouter(tags=["skills"])


@router.get("/skills", response_model=list[schemas.SkillOut])
async def list_skills(
    type: Type | None = None,
    parent_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает список навыков из справочника.
    :param type: если указан, фильтрует навыки по типу (ability/saving_throw/skill)
    :param parent_id: если указан, возвращает только дочерние навыки этого родителя
    :param db: сессия БД
    :return: список навыков (list[SkillOut])
    """
    filter_parent = parent_id is not None
    return await skills_repository.list_skills(db, type, parent_id, filter_parent=filter_parent)


@router.get("/skills/{skill_id}", response_model=schemas.SkillOut)
async def get_skill(
    skill_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает навык по id.
    :param skill_id: id навыка
    :param db: сессия БД
    :return: найденный навык (SkillOut)
    """
    skill = await skills_repository.get_by_id(db, skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Навык не найден")
    return skill
