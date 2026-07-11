from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from content_service.app import schemas
from content_service.app.db import get_db
from content_service.app.dependencies import require_room_master
from content_service.app.repositories import folders_repository

router = APIRouter(tags=["document-folders"])

# создание папки
@router.post(
    "/rooms/{room_id}/document-folders",
    response_model=schemas.DocumentFolderOut, # автоматическое преобразование Folder в схему
    status_code=status.HTTP_201_CREATED,
)
async def create_folder(
    room_id: int,
    payload: schemas.DocumentFolderCreate,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    if payload.parent_folder_id is not None:
        parent = await folders_repository.get_by_id(db, payload.parent_folder_id)
        if parent is None or parent.room_id != room_id:
            raise HTTPException(status_code=400, detail="Родительская папка не найдена в этой комнате")

    return await folders_repository.create(db, room_id, payload.name, payload.parent_folder_id)

# получение списка папок
@router.get(
    "/rooms/{room_id}/document-folders",
    response_model=schemas.Page[schemas.DocumentFolderOut],
)
async def list_folders(
    room_id: int,
    parent_folder_id: int | None = None,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    items = await folders_repository.list_by_room(db, room_id, parent_folder_id, filter_parent=True)
    return schemas.Page(items=items, total=len(items))

# обновление папки
@router.patch(
    "/rooms/{room_id}/document-folders/{folder_id}",
    response_model=schemas.DocumentFolderOut,
)
async def update_folder(
    room_id: int,
    folder_id: int,
    payload: schemas.DocumentFolderUpdate,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    folder = await folders_repository.get_by_id(db, folder_id)
    if folder is None or folder.room_id != room_id:
        raise HTTPException(status_code=404, detail="Папка не найдена")

    parent_set = "parent_folder_id" in payload.model_fields_set
    if parent_set and payload.parent_folder_id is not None:
        parent = await folders_repository.get_by_id(db, payload.parent_folder_id)
        if parent is None or parent.room_id != room_id:
            raise HTTPException(status_code=400, detail="Родительская папка не найдена в этой комнате")

    return await folders_repository.update(db, folder, payload.name, payload.parent_folder_id, parent_set)

# удаление папки
@router.delete(
    "/rooms/{room_id}/document-folders/{folder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_folder(
    room_id: int,
    folder_id: int,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    folder = await folders_repository.get_by_id(db, folder_id)
    if folder is None or folder.room_id != room_id:
        raise HTTPException(status_code=404, detail="Папка не найдена")
    try:
        await folders_repository.delete(db, folder)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Нельзя удалить папку: в ней есть документы или вложенные папки",
        )