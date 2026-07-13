from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app import schemas
from content_service.app.db import get_db
from content_service.app.dependencies import require_room_master
from content_service.app.repositories import media_folders_repository

router = APIRouter(tags=["media-folders"])


@router.post(
    "/rooms/{room_id}/media-folders",
    response_model=schemas.MediaFolderOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_media_folder(
    room_id: int,
    payload: schemas.MediaFolderCreate,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Создаёт медиапапку в указанной комнате (доступно только мастеру комнаты).
    :param room_id: id комнаты, в которой создаётся папка
    :param payload: данные новой папки (name)
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: созданная медиапапка (MediaFolderOut)
    """
    return await media_folders_repository.create(db, room_id, payload.name)


@router.get(
    "/rooms/{room_id}/media-folders",
    response_model=list[schemas.MediaFolderOut],
)
async def list_media_folders(
    room_id: int,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает список медиапапок комнаты (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: список медиапапок (list[MediaFolderOut])
    """
    return await media_folders_repository.list_by_room(db, room_id)


@router.patch(
    "/rooms/{room_id}/media-folders/{folder_id}",
    response_model=schemas.MediaFolderOut,
)
async def update_media_folder(
    room_id: int,
    folder_id: int,
    payload: schemas.MediaFolderUpdate,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Переименовывает медиапапку (доступно только мастеру комнаты).
    :param room_id: id комнаты, которой должна принадлежать папка
    :param folder_id: id редактируемой медиапапки
    :param payload: поля для обновления (name)
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: обновлённая медиапапка (MediaFolderOut)
    """
    folder = await media_folders_repository.get_by_id(db, folder_id)
    if folder is None or folder.room_id != room_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Папка не найдена")
    return await media_folders_repository.update(db, folder, payload.name)


@router.delete(
    "/rooms/{room_id}/media-folders/{folder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_media_folder(
    room_id: int,
    folder_id: int,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаляет медиапапку (доступно только мастеру комнаты).
    :param room_id: id комнаты, которой должна принадлежать папка
    :param folder_id: id удаляемой медиапапки
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    folder = await media_folders_repository.get_by_id(db, folder_id)
    if folder is None or folder.room_id != room_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Папка не найдена")
    await media_folders_repository.delete(db, folder)