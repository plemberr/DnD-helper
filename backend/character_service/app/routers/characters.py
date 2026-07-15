from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from character_service.app import schemas
from character_service.app.db import get_db
from character_service.app.dependencies import get_current_user_id
from character_service.app.repositories import character_repository
from character_service.app.services import character_items_service as items_svc
from character_service.app.services import character_progression_service as progression_svc
from character_service.app.services import character_service as svc
from character_service.app.services.common import serialize_items, serialize_spells

router = APIRouter(tags=["characters"])


# создание персонажа
@router.post(
    "/rooms/{room_id}/characters",
    response_model=schemas.CharacterOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_character(
    room_id: int,
    payload: schemas.CharacterCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Создаёт нового персонажа в комнате"""
    return await svc.create_character(db, room_id, user_id, payload)


# список персонажей комнаты
@router.get("/rooms/{room_id}/characters", response_model=schemas.CharactersListResponse)
async def list_characters(
    room_id: int,
    user_id: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Возвращает список персонажей комнаты с возможной фильтрацией по владельцу"""
    items, total = await svc.list_characters(db, room_id, user_id)
    return schemas.CharactersListResponse(items=items, total=total)


# получение персонажа
@router.get("/rooms/{room_id}/characters/{character_id}", response_model=schemas.CharacterDetail)
async def get_character(
    room_id: int,
    character_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Возвращает детальную информацию о персонаже, включая навыки"""
    return await svc.get_character_detail(db, room_id, character_id)


# обновление персонажа
@router.patch("/rooms/{room_id}/characters/{character_id}", response_model=schemas.CharacterUpdateOut)
async def update_character(
    room_id: int,
    character_id: int,
    payload: schemas.CharacterUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Обновляет профиль персонажа (только переданные поля)"""
    return await svc.update_character(db, room_id, character_id, user_id, payload)


# удаление персонажа
@router.delete("/rooms/{room_id}/characters/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    room_id: int,
    character_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Удаляет персонажа"""
    await svc.delete_character(db, room_id, character_id, user_id)


# заклинания
@router.post(
    "/rooms/{room_id}/characters/{character_id}/spells",
    response_model=schemas.SpellAddOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_spell(
    character_id: int,
    payload: schemas.SpellAdd,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Добавляет заклинание персонажу. room_id персонажа определяется по персонажу"""
    character = await character_repository.get_character_by_id(db, character_id)
    if character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Персонаж не найден")

    character = await items_svc.add_spell(db, character.room_id, character_id, user_id, payload.spell_id)
    return schemas.SpellAddOut(id=character.id, spells=serialize_spells(character.spells))


@router.get("/rooms/{room_id}/characters/{character_id}/spells", response_model=schemas.SpellsOut)
async def get_spells(
    room_id: int,
    character_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Возвращает список заклинаний персонажа"""
    return await items_svc.get_spells(db, room_id, character_id)


@router.delete(
    "/rooms/{room_id}/characters/{character_id}/spells/{spell_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_spell(
    room_id: int,
    character_id: int,
    spell_id: str,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Удаляет заклинание у персонажа"""
    await items_svc.remove_spell(db, room_id, character_id, user_id, spell_id)


# инвентарь
@router.put("/rooms/{room_id}/characters/{character_id}/inventory", response_model=schemas.InventoryOut)
async def set_inventory(
    room_id: int,
    character_id: int,
    payload: schemas.InventoryUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Заменяет инвентарь персонажа новым набором"""
    character = await items_svc.set_inventory(db, room_id, character_id, user_id, payload.inventory)
    return schemas.InventoryOut(id=character.id, inventory=serialize_items(character.inventory))


@router.get(
    "/rooms/{room_id}/characters/{character_id}/inventory",
    response_model=list[schemas.Item],
)
async def get_inventory(
    room_id: int,
    character_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Возвращает инвентарь персонажа"""
    return await items_svc.get_inventory(db, room_id, character_id)


# черты
@router.put("/rooms/{room_id}/characters/{character_id}/feats", response_model=schemas.FeatsOut)
async def set_feats(
    room_id: int,
    character_id: int,
    payload: schemas.FeatsUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Заменяет черты персонажа новым набором"""
    character = await items_svc.set_feats(db, room_id, character_id, user_id, payload.feats)
    return schemas.FeatsOut(id=character.id, feats=serialize_items(character.feats))


@router.get(
    "/rooms/{room_id}/characters/{character_id}/feats",
    response_model=list[schemas.Item],
)
async def get_feats(
    room_id: int,
    character_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Возвращает черты персонажа"""
    return await items_svc.get_feats(db, room_id, character_id)


# навыки
@router.get(
    "/rooms/{room_id}/characters/{character_id}/skills",
    response_model=schemas.SkillsListResponse,
)
async def list_skills(
    room_id: int,
    character_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Возвращает список навыков персонажа"""
    items, total = await progression_svc.list_skills(db, room_id, character_id)
    return schemas.SkillsListResponse(items=items, total=total)


@router.patch(
    "/rooms/{room_id}/characters/{character_id}/skills/{skill_id}",
    response_model=schemas.SkillItem,
)
async def update_skill(
    room_id: int,
    character_id: int,
    skill_id: int,
    payload: schemas.SkillUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Обновляет уровень владения навыком персонажа"""
    skill = await progression_svc.update_skill(db, room_id, character_id, user_id, skill_id, payload.level)
    return schemas.SkillItem(skill_id=skill.skill_id, level=skill.level, value=skill.value)


# HP
@router.patch("/rooms/{room_id}/characters/{character_id}/hp", response_model=schemas.HpOut)
async def change_hp(
    room_id: int,
    character_id: int,
    payload: schemas.HpUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Изменяет текущее HP персонажа"""
    character = await progression_svc.change_hp(db, room_id, character_id, user_id, payload.delta)
    return schemas.HpOut(id=character.id, hp_current=character.hp_current, hp_max=character.hp_max)


# вдохновение
@router.post(
    "/rooms/{room_id}/characters/{character_id}/inspiration",
    response_model=schemas.InspirationOut,
)
async def grant_inspiration(
    room_id: int,
    character_id: int,
    payload: schemas.InspirationGrant,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Начисляет персонажу очки вдохновения"""
    character = await progression_svc.grant_inspiration(db, room_id, character_id, user_id, payload.amount)
    return schemas.InspirationOut(id=character.id, inspiration=character.inspiration)


@router.post(
    "/rooms/{room_id}/characters/{character_id}/inspiration/use",
    response_model=schemas.InspirationOut,
)
async def use_inspiration(
    room_id: int,
    character_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Тратит одно очко вдохновения персонажа"""
    character = await progression_svc.use_inspiration(db, room_id, character_id, user_id)
    return schemas.InspirationOut(id=character.id, inspiration=character.inspiration)