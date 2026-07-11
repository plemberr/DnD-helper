from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app import schemas
from content_service.app.db import get_db
from content_service.app.dependencies import get_current_user_id
from content_service.app.models import EntityType
from content_service.app.repositories import documents_repository, favorites_repository, media_files_repository

router = APIRouter(tags=["favorites"])


@router.post("/favorites", response_model=schemas.FavoriteOut, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    payload: schemas.FavoriteCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        entity_type = EntityType(payload.entity_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Некорректный entity_type")

    if entity_type == EntityType.document:
        entity = await documents_repository.get_by_id(db, payload.entity_id)
    else:
        entity = await media_files_repository.get_by_id(db, payload.entity_id)

    if entity is None:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    favorite = await favorites_repository.create(db, user_id, entity_type, payload.entity_id)
    return schemas.FavoriteOut(
        id=favorite.id,
        entity_type=favorite.entity_type,
        entity_id=favorite.entity_id,
        added_at=favorite.created_at,
    )


@router.get("/rooms/{room_id}/favorites", response_model=schemas.Page[schemas.FavoriteListItem])
async def list_favorites(
    room_id: int,
    entity_type: str | None = None,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    et = EntityType(entity_type) if entity_type else None
    favorites = await favorites_repository.list_by_user(db, user_id, et)

    items: list[schemas.FavoriteListItem] = []
    for fav in favorites:
        if fav.entity_type == EntityType.document:
            doc = await documents_repository.get_by_id(db, fav.entity_id)
            if doc is None or doc.room_id != room_id:
                continue
            items.append(schemas.FavoriteListItem(
                entity_type=fav.entity_type, entity_id=fav.entity_id, title=doc.title, added_at=fav.created_at,
            ))
        else:
            media = await media_files_repository.get_by_id(db, fav.entity_id)
            if media is None or media.room_id != room_id:
                continue
            items.append(schemas.FavoriteListItem(
                entity_type=fav.entity_type, entity_id=fav.entity_id, title=media.original_name, added_at=fav.created_at,
            ))

    return schemas.Page(items=items, total=len(items))


@router.delete("/favorites/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    favorite_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    favorite = await favorites_repository.get_by_id(db, favorite_id)
    if favorite is None or favorite.user_id != user_id:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    await favorites_repository.delete(db, favorite)
