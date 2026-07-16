from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from room_service.app.models import JoinRequests, Status


async def get_request_by_id(db: AsyncSession, request_id: int) -> Optional[JoinRequests]:
    """
    Возвращает заявку на вступление по её id.
    :param db: сессия БД
    :param request_id: id заявки
    :return: найденная заявка или None, если не существует
    """
    result = await db.execute(select(JoinRequests).where(JoinRequests.id == request_id))
    return result.scalar_one_or_none()


async def get_pending_request(db: AsyncSession, room_id: int, user_id: int) -> Optional[JoinRequests]:
    """
    Возвращает необработанную (pending) заявку пользователя на вступление в комнату.
    :param db: сессия БД
    :param room_id: id комнаты
    :param user_id: id пользователя
    :return: найденная заявка или None, если её нет
    """
    result = await db.execute(
        select(JoinRequests).where(
            JoinRequests.room_id == room_id,
            JoinRequests.user_id == user_id,
            JoinRequests.status == Status.pending,
        )
    )
    return result.scalar_one_or_none()


async def list_requests(
    db: AsyncSession,
    room_id: int,
    status: Optional[Status] = None,
) -> List[JoinRequests]:
    """
    Возвращает список заявок на вступление в комнату.
    :param db: сессия БД
    :param room_id: id комнаты
    :param status: фильтр по статусу заявки (если None, возвращаются заявки всех статусов)
    :return: список заявок, отсортированный по дате создания (сначала новые)
    """
    query = select(JoinRequests).where(JoinRequests.room_id == room_id)
    if status is not None:
        query = query.where(JoinRequests.status == status)
    query = query.order_by(JoinRequests.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def create_request(db: AsyncSession, room_id: int, user_id: int, username: str) -> JoinRequests:
    """
    Создаёт заявку на вступление в комнату со статусом pending.
    :param db: сессия БД
    :param room_id: id комнаты
    :param user_id: id пользователя, отправляющего заявку
    :param username: имя пользователя
    :return: созданная заявка
    """
    request = JoinRequests(
        room_id=room_id,
        user_id=user_id,
        username=username,
        status=Status.pending,
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


async def update_status(db: AsyncSession, request: JoinRequests, status: Status) -> JoinRequests:
    """
    Обновляет статус заявки на вступление.
    :param db: сессия БД
    :param request: изменяемая заявка
    :param status: новый статус
    :return: обновлённая заявка
    """
    request.status = status
    await db.commit()
    await db.refresh(request)
    return request


async def delete_request(db: AsyncSession, request: JoinRequests) -> None:
    """
    Удаляет заявку на вступление (отзыв заявки).
    :param db: сессия БД
    :param request: удаляемая заявка
    :return: ничего
    """
    await db.delete(request)
    await db.commit()
