from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app import schemas
from content_service.app.db import get_db
from content_service.app.dependencies import get_current_user_id, require_room_master
from content_service.app.repositories import documents_repository, folders_repository

router = APIRouter(tags=["documents"])

# создание документа
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
    folder = await folders_repository.get_by_id(db, folder_id)
    if folder is None:
        raise HTTPException(status_code=404, detail="Папка не найдена")

    # Право на создание документа проверяем как право мастера комнаты, которой принадлежит папка
    await require_room_master(room_id=folder.room_id, user_id=user_id, db=db)

    return await documents_repository.create(db, folder.room_id, folder_id, payload.title, payload.content, user_id)

# получение документов в папке
@router.get(
    "/document-folders/{folder_id}/documents",
    response_model=schemas.Page[schemas.DocumentListItem],
)
async def list_documents_in_folder(
    folder_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    folder = await folders_repository.get_by_id(db, folder_id)
    if folder is None:
        raise HTTPException(status_code=404, detail="Папка не найдена")

    items = await documents_repository.list_by_folder(db, folder_id)
    return schemas.Page(items=items, total=len(items))

# получение документа
@router.get("/documents/{documents_id}", response_model=schemas.DocumentOut)
async def get_document(
    documents_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    document = await documents_repository.get_by_id(db, documents_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Документ не найден")
    return document

# обновление документа
@router.patch("/documents/{documents_id}", response_model=schemas.DocumentOut)
async def update_document(
    documents_id: int,
    payload: schemas.DocumentUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    document = await documents_repository.get_by_id(db, documents_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Документ не найден")

    await require_room_master(room_id=document.room_id, user_id=user_id, db=db)

    return await documents_repository.update(db, document, payload.title, payload.content, payload.is_secret)

# удаление документа
@router.delete("/documents/{documents_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    documents_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    document = await documents_repository.get_by_id(db, documents_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Документ не найден")

    await require_room_master(room_id=document.room_id, user_id=user_id, db=db)

    await documents_repository.delete(db, document)
