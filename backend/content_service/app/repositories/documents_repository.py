from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.models import Document


async def create(db: AsyncSession, room_id: int, folder_id: int, title: str, content: str, created_by: int) -> Document:
    """
    Создаёт документ в указанной папке.
    :param db: сессия БД
    :param room_id: id комнаты, которой принадлежит документ
    :param folder_id: id папки, в которую помещается документ
    :param title: заголовок документа
    :param content: текст документа
    :param created_by: id пользователя, создавшего документ
    :return: созданный документ
    """
    document = Document(room_id=room_id, folder_id=folder_id, title=title, content=content, created_by=created_by)
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document


async def get_by_id(db: AsyncSession, document_id: int) -> Document | None:
    """
    Возвращает документ по его id.
    :param db: сессия БД
    :param document_id: id документа
    :return: найденный документ или None, если не существует
    """
    return (await db.execute(select(Document).where(Document.id == document_id))).scalar_one_or_none()


async def list_by_folder(db: AsyncSession, folder_id: int) -> list[Document]:
    """
    Возвращает список документов, лежащих в указанной папке, отсортированный по заголовку.
    :param db: сессия БД
    :param folder_id: id папки документов
    :return: список документов
    """
    result = await db.execute(
        select(Document).where(Document.folder_id == folder_id).order_by(Document.title)
    )
    return list(result.scalars().all())  # достать именно объекты Document и получить список


async def update(db: AsyncSession, document: Document, title: str | None, content: str | None, is_secret: bool | None) -> Document:
    """
    Обновляет документ, обновляются только переданные поля.
    :param db: сессия БД
    :param document: обновляемый документ
    :param title: новый заголовок (если None, то не изменяется)
    :param content: новый текст (если None, то не изменяется)
    :param is_secret: новый признак секретности (если None, то не изменяется)
    :return: обновлённый документ
    """
    if title is not None:
        document.title = title
    if content is not None:
        document.content = content
    if is_secret is not None:
        document.is_secret = is_secret
    await db.commit()
    await db.refresh(document)
    return document


async def delete(db: AsyncSession, document: Document) -> None:
    """
    Удаляет документ.
    :param db: сессия БД
    :param document: удаляемый документ
    :return: ничего
    """
    await db.delete(document)
    await db.commit()


async def search(db: AsyncSession, room_id: int, q: str, limit: int = 20) -> list[Document]:
    """
    Ищет документы комнаты по подстроке в заголовке или содержимом.
    :param db: сессия БД
    :param room_id: id комнаты, в которой выполняется поиск
    :param q: искомая подстрока
    :param limit: максимальное количество результатов
    :return: список найденных документов
    """
    pattern = f"%{q}%"
    result = await db.execute(
        select(Document)
        .where(Document.room_id == room_id)
        .where(or_(Document.title.ilike(pattern), Document.content.ilike(pattern)))
        .limit(limit)
    )
    return list(result.scalars().all())