from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app import schemas, storage
from content_service.app.db import get_db
from content_service.app.dependencies import get_current_user_id, require_room_master
from content_service.app.models import Type
from content_service.app.repositories import favorites_repository, media_files_repository
from content_service.app.models import EntityType

router = APIRouter(tags=["media"])


def _split_tags(tags: list[str] | None) -> list[str] | None:
    """
    Нормализует список тегов.
    Позволяет передавать теги как отдельные form-поля ("tag1", "tag2"),
    так и одной строкой через запятую ("tag1,tag2")
    :param tags: сырой список тегов из формы (может быть None)
    :return: очищенный список тегов или None, если тегов нет
    """
    if not tags:
        return None
    result: list[str] = []
    for t in tags:
        result.extend([p.strip() for p in t.split(",") if p.strip()])
    return result or None


async def _to_media_out(db: AsyncSession, media, user_id: int) -> schemas.MediaFileOut:
    """
    Преобразует модель MediaFile в схему ответа, добавляя
    флаг is_favorite для текущего пользователя.
    :param db: сессия БД
    :param media: модель MediaFile
    :param user_id: id текущего пользователя, для которого проверяется избранное
    :return: схема ответа (MediaFileOut)
    """
    fav = await favorites_repository.list_by_user(db, user_id, EntityType.media)
    is_favorite = any(f.entity_id == media.id for f in fav)
    return schemas.MediaFileOut(
        id=media.id,
        room_id=media.room_id,
        type=media.type,
        url=media.file_url or media.external_url,
        thumbnail_url=media.thumbnail_url,
        duration_seconds=media.duration_seconds,
        folder_id=media.media_folder_id,
        tags=media.tags,
        is_favorite=is_favorite,
        created_at=media.created_at,
    )


@router.post("/rooms/{room_id}/media/images", response_model=schemas.MediaFileOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    room_id: int,
    folder_id: int = Form(...),
    tags: list[str] = Form(default=[]),
    file: UploadFile = File(...),
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Загружает изображение в медиапапку комнаты (доступно только мастеру комнаты).
    Файл сохраняется на диск (media_storage), в БД создаётся запись с
    публичным URL, ведущим на этот файл.
    :param room_id: id комнаты, в которую загружается изображение
    :param folder_id: id медиапапки, в которую кладётся файл
    :param tags: список тегов
    :param file: сам файл изображения
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: созданная запись о медиафайле (MediaFileOut)
    """
    url, size = await storage.save_upload(file, subfolder=f"rooms/{room_id}/images")
    media = await media_files_repository.create(
        db,
        room_id=room_id,
        media_folder_id=folder_id,
        type_=Type.image,
        uploaded_by=user_id,
        original_name=file.filename or "image",
        file_url=url,
        thumbnail_url=url,
        size=size,
        tags=_split_tags(tags),
    )
    return await _to_media_out(db, media, user_id)


@router.get("/rooms/{room_id}/media/images", response_model=schemas.Page[schemas.MediaFileOut])
async def list_images(
    room_id: int,
    folder_id: int | None = None,
    tags: list[str] | None = None,
    search: str | None = None,
    favorites_only: bool = False,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает список изображений комнаты с возможностью фильтрации (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param folder_id: если передан, вернуть изображения только из этой медиапапки
    :param tags: если переданы, то вернуть изображения, содержащие эти теги
    :param search: подстрока для поиска по названию файла
    :param favorites_only: если True, то вернуть только избранные изображения текущего пользователя
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: страница со списком изображений (Page[MediaFileOut])
    """
    items = await media_files_repository.list_by_room(db, room_id, Type.image, folder_id, tags, search)
    out = [await _to_media_out(db, m, user_id) for m in items]
    if favorites_only:
        out = [m for m in out if m.is_favorite]
    return schemas.Page(items=out, total=len(out))


@router.delete("/media/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    image_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаляет изображение (запись в БД и физический файл на диске) (доступно только мастеру комнаты).
    :param image_id: id удаляемого изображения
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    media = await media_files_repository.get_by_id(db, image_id)
    if media is None or media.type != Type.image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Изображение не найдено")
    await require_room_master(room_id=media.room_id, user_id=user_id, db=db)
    storage.delete_file(media.file_url)
    await media_files_repository.delete(db, media)


@router.post("/rooms/{room_id}/media/audio", response_model=schemas.MediaFileOut, status_code=status.HTTP_201_CREATED)
async def upload_audio(
    room_id: int,
    folder_id: int = Form(...),
    tags: list[str] = Form(default=[]),
    external_url: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Добавляет аудиофайл в медиапапку комнаты (доступно только мастеру комнаты).
    Поддерживает 2 способа: загрузить реальный файл (file),
    либо просто сослаться на внешний ресурс (external_url), не загружая его на диск.

    :param room_id: id комнаты, в которую добавляется аудио
    :param folder_id: id медиапапки, в которую кладётся файл/ссылка
    :param tags: список тегов
    :param external_url: внешняя ссылка на аудио (используется, если file не передан)
    :param file: сам аудиофайл (используется, если external_url не передан)
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: созданная запись о медиафайле (MediaFileOut)
    """
    if file is None and not external_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нужно передать либо file, либо external_url",
        )

    url = external_url
    size = None
    if file is not None:
        url, size = await storage.save_upload(file, subfolder=f"rooms/{room_id}/audio")

    media = await media_files_repository.create(
        db,
        room_id=room_id,
        media_folder_id=folder_id,
        type_=Type.audio,
        uploaded_by=user_id,
        original_name=(file.filename if file else external_url) or "audio",
        file_url=url if file is not None else None,
        external_url=external_url if file is None else None,
        size=size,
        tags=_split_tags(tags),
    )
    return await _to_media_out(db, media, user_id)


@router.get("/rooms/{room_id}/media/audio", response_model=schemas.Page[schemas.MediaFileOut])
async def list_audio(
    room_id: int,
    folder_id: int | None = None,
    tags: list[str] | None = None,
    search: str | None = None,
    user_id: int = Depends(require_room_master),
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает список аудиофайлов комнаты с возможностью фильтрации (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param folder_id: если передан,то вернуть аудио только из этой медиапапки
    :param tags: если переданы, то вернуть аудио, содержащие эти теги
    :param search: подстрока для поиска по названию файла
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: страница со списком аудиофайлов (Page[MediaFileOut])
    """
    items = await media_files_repository.list_by_room(db, room_id, Type.audio, folder_id, tags, search)
    out = [await _to_media_out(db, m, user_id) for m in items]
    return schemas.Page(items=out, total=len(out))


@router.delete("/media/audio/{audio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_audio(
    audio_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаляет аудиофайл (запись в БД и физический файл на диске) (доступно только мастеру комнаты).
    :param audio_id: id удаляемого аудиофайла
    :param user_id: id текущего пользователя (подставляется из токена, должен быть мастером комнаты)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    media = await media_files_repository.get_by_id(db, audio_id)
    if media is None or media.type != Type.audio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Аудиофайл не найден")
    await require_room_master(room_id=media.room_id, user_id=user_id, db=db)
    storage.delete_file(media.file_url)
    await media_files_repository.delete(db, media)