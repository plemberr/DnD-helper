from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.models import Folder


async def create(db: AsyncSession, room_id: int, name: str, parent_folder_id: int | None) -> Folder:
    """
    Создаёт папку документов в указанной комнате.
    :param db: сессия БД
    :param room_id: id комнаты, в которой создаётся папка
    :param name: название папки
    :param parent_folder_id: id родительской папки
    :return: созданная папка
    """
    folder = Folder(room_id=room_id, name=name, parent_folder_id=parent_folder_id)
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    return folder


async def list_by_room(db: AsyncSession, room_id: int, parent_folder_id: int | None = None, filter_parent: bool = False) -> list[Folder]:
    """
    Возвращает список папок документов комнаты, отсортированный по названию.
    :param db: сессия БД
    :param room_id: id комнаты
    :param parent_folder_id: id родительской папки, по которой фильтруем (учитывается только если filter_parent=True)
    :param filter_parent: если True, то вернуть только папки с указанным parent_folder_id
    :return: список папок
    """
    query = select(Folder).where(Folder.room_id == room_id)
    if filter_parent:
        query = query.where(Folder.parent_folder_id == parent_folder_id)
    result = await db.execute(query.order_by(Folder.name))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, folder_id: int) -> Folder | None:
    """
    Возвращает папку документов по её id.
    :param db: сессия БД
    :param folder_id: id папки
    :return: найденная папка или None, если не существует
    """
    return (await db.execute(select(Folder).where(Folder.id == folder_id))).scalar_one_or_none()


async def update(db: AsyncSession, folder: Folder, name: str | None, parent_folder_id: int | None, parent_set: bool) -> Folder:
    """
    Обновляет папку документов (переименовывает и/или перемещает).
    :param db: сессия БД
    :param folder: обновляемая папка
    :param name: новое название (если None, то не изменяется)
    :param parent_folder_id: новый id родительской папки (учитывается только если parent_set=True)
    :param parent_set: если True, то обновить parent_folder_id (в том числе установить в None,
    сделав папку папкой верхнего уровня, если False, то родителя не трогать)
    :return: обновлённая папка
    """
    if name is not None:
        folder.name = name
    if parent_set:
        folder.parent_folder_id = parent_folder_id
    await db.commit()
    await db.refresh(folder)
    return folder


async def delete(db: AsyncSession, folder: Folder) -> None:
    """
    Удаляет папку документов.
    :param db: сессия БД
    :param folder: удаляемая папка
    :return: ничего
    """
    await db.delete(folder)
    await db.commit()