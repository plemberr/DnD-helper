from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app import schemas
from content_service.app.db import get_db
from content_service.app.dependencies import require_room_master
from content_service.app.repositories import documents_repository, media_files_repository
from content_service.app.models import Type

router = APIRouter(tags=["search"])


@router.get("/rooms/{room_id}/search", response_model=list[schemas.SearchResultItem])
async def global_search(
    room_id: int,
    q: str,
    type: str | None = None,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Выполняет поиск по документам и/или медиафайлам комнаты (доступно только мастеру комнаты).
    :param room_id: id комнаты, в которой выполняется поиск
    :param q: поисковая строка
    :param type: если передан "documents"/"media", то искать только среди этого типа сущностей,
    если не передан, то искать среди обоих типов
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: список найденных результатов (list[SearchResultItem])
    """
    results: list[schemas.SearchResultItem] = []

    if type in (None, "documents"):
        for doc in await documents_repository.search(db, room_id, q):
            snippet = doc.content[:160] + ("…" if len(doc.content) > 160 else "")
            results.append(schemas.SearchResultItem(
                entity_type="document", entity_id=doc.id, title=doc.title, snippet=snippet,
            ))

    if type in (None, "media"):
        for media_type in (Type.image, Type.audio):
            for media in await media_files_repository.list_by_room(db, room_id, media_type, search=q):
                results.append(schemas.SearchResultItem(
                    entity_type="media", entity_id=media.id, title=media.original_name, snippet=media.type,
                ))

    return results