from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app import schemas
from content_service.app.db import get_db
from content_service.app.dependencies import get_current_user_id, require_room_master
from content_service.app.repositories import documents_repository, folders_repository

router = APIRouter(tags=["documents"])


@router.post(
    "/document-folders/{folder_id}/documents",
    response_model=schemas.DocumentOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_document(
    folder_id: int,
    payload: schemas.DocumentCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Создаёт документ внутри указанной папки (доступно только мастеру комнаты).
    :param folder_id: id папки, в которую добавляется документ
    :param payload: данные документа (title, content)
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: созданный документ (DocumentOut)
    """
    folder = await folders_repository.get_by_id(db, folder_id)
    if folder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Папка не найдена")

    # Право на создание документа проверяем как право мастера комнаты, которой принадлежит папка
    await require_room_master(room_id=folder.room_id, user_id=user_id, db=db)

    return await documents_repository.create(db, folder.room_id, folder_id, payload.title, payload.content, user_id)


@router.get(
    "/document-folders/{folder_id}/documents",
    response_model=list[schemas.DocumentListItem],
)
async def list_documents_in_folder(
    folder_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает список документов, лежащих в указанной папке (доступно только мастеру комнаты).
    :param folder_id: id папки документов
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: список документов (list[DocumentListItem])
    """
    folder = await folders_repository.get_by_id(db, folder_id)
    if folder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Папка не найдена")

    return await documents_repository.list_by_folder(db, folder_id)


@router.get("/documents/{documents_id}", response_model=schemas.DocumentOut)
async def get_document(
    documents_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает документ по его id.
    :param documents_id: id документа
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: документ (DocumentOut)
    """
    document = await documents_repository.get_by_id(db, documents_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Документ не найден")
    return document


@router.patch("/documents/{documents_id}", response_model=schemas.DocumentOut)
async def update_document(
    documents_id: int,
    payload: schemas.DocumentUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Редактирует документ (доступно только мастеру комнаты).
    :param documents_id: id редактируемого документа
    :param payload: поля для обновления, обновляются только переданные
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: обновлённый документ (DocumentOut)
    """
    document = await documents_repository.get_by_id(db, documents_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Документ не найден")

    await require_room_master(room_id=document.room_id, user_id=user_id, db=db)

    return await documents_repository.update(db, document, payload.title, payload.content, payload.is_secret)


@router.delete("/documents/{documents_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    documents_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаляет документ (доступно только мастеру комнаты).

    :param documents_id: id удаляемого документа
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    document = await documents_repository.get_by_id(db, documents_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Документ не найден")

    await require_room_master(room_id=document.room_id, user_id=user_id, db=db)

    await documents_repository.delete(db, document)