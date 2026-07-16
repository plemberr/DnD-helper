from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from content_service.app import schemas
from content_service.app.db import get_db
from content_service.app.dependencies import require_room_master
from content_service.app.repositories import folders_repository

router = APIRouter(tags=["document-folders"])


@router.post(
    "/rooms/{room_id}/document-folders",
    response_model=schemas.FolderOut,  # автоматическое преобразование Folder в схему
    status_code=status.HTTP_201_CREATED,
)
async def create_folder(
    room_id: int,
    payload: schemas.FolderCreate,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Создаёт папку документов в указанной комнате (доступно только мастеру комнаты).
    :param room_id: id комнаты, в которой создаётся папка
    :param payload: данные новой папки (name, опционально parent_folder_id)
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: созданная папка (DocumentFolderOut)
    """
    if payload.parent_folder_id is not None:
        parent = await folders_repository.get_by_id(db, payload.parent_folder_id)
        if parent is None or parent.room_id != room_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Родительская папка не найдена в этой комнате",
            )

    return await folders_repository.create(db, room_id, payload.name, payload.parent_folder_id)


@router.get(
    "/rooms/{room_id}/document-folders",
    response_model=list[schemas.FolderOut],
)
async def list_folders(
    room_id: int,
    parent_folder_id: int | None = None,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает список папок документов комнаты (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param parent_folder_id: если передан, то вернуть только подпапки этой папки,
    если не передан, то вернуть папки верхнего уровня
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: список папок (list[DocumentFolderOut])
    """
    return await folders_repository.list_by_room(db, room_id, parent_folder_id, filter_parent=True)


@router.patch(
    "/rooms/{room_id}/document-folders/{folder_id}",
    response_model=schemas.FolderOut,
)
async def update_folder(
    room_id: int,
    folder_id: int,
    payload: schemas.FolderUpdate,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Переименовывает и/или перемещает папку документов (доступно только мастеру комнаты).
    :param room_id: id комнаты, которой должна принадлежать папка
    :param folder_id: id редактируемой папки
    :param payload: поля для обновления (name, опционально parent_folder_id)
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты_
    :param db: сессия БД
    :return: обновлённая папка (DocumentFolderOut)
    """
    folder = await folders_repository.get_by_id(db, folder_id)
    if folder is None or folder.room_id != room_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Папка не найдена")

    parent_set = "parent_folder_id" in payload.model_fields_set
    if parent_set and payload.parent_folder_id is not None:
        parent = await folders_repository.get_by_id(db, payload.parent_folder_id)
        if parent is None or parent.room_id != room_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Родительская папка не найдена в этой комнате",
            )

    return await folders_repository.update(db, folder, payload.name, payload.parent_folder_id, parent_set)


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
    """
    Удаляет папку документов (доступно только мастеру комнаты).
    Если в папке остались документы или вложенные подпапки, удаление будет
    отклонено с 409 Conflict
    :param room_id: id комнаты, которой должна принадлежать папка
    :param folder_id: id удаляемой папки
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    folder = await folders_repository.get_by_id(db, folder_id)
    if folder is None or folder.room_id != room_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Папка не найдена")
    try:
        await folders_repository.delete(db, folder)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя удалить папку: в ней есть документы или вложенные папки",
        )