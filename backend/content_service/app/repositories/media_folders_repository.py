from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.models import MediaFolder


async def create(db: AsyncSession, room_id: int, name: str) -> MediaFolder:
    """
    Создаёт медиапапку в указанной комнате.
    :param db: сессия БД
    :param room_id: id комнаты, в которой создаётся папка
    :param name: название папки
    :return: созданная медиапапка
    """
    folder = MediaFolder(room_id=room_id, name=name)
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    return folder


async def list_by_room(db: AsyncSession, room_id: int) -> list[MediaFolder]:
    """
    Возвращает все медиапапки комнаты, отсортированные по названию.
    :param db: сессия БД
    :param room_id: id комнаты
    :return: список медиапапок
    """
    result = await db.execute(select(MediaFolder).where(MediaFolder.room_id == room_id).order_by(MediaFolder.name))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, folder_id: int) -> MediaFolder | None:
    """
    Возвращает медиапапку по её id.
    :param db: сессия БД
    :param folder_id: id медиапапки
    :return: найденная медиапапка или None, если не существует
    """
    return (await db.execute(select(MediaFolder).where(MediaFolder.id == folder_id))).scalar_one_or_none()


async def update(db: AsyncSession, folder: MediaFolder, name: str | None) -> MediaFolder:
    """
    Обновляет название медиапапки.
    :param db: сессия БД
    :param folder: обновляемая медиапапка
    :param name: новое название (если None, название не изменяется)
    :return: обновлённая медиапапка
    """
    if name is not None:
        folder.name = name
    await db.commit()
    await db.refresh(folder)
    return folder


async def delete(db: AsyncSession, folder: MediaFolder) -> None:
    """
    Удаляет медиапапку.
    :param db: сессия БД
    :param folder: удаляемая медиапапка
    :return: ничего
    """
    await db.delete(folder)
    await db.commit()