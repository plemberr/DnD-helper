from typing import List, Optional, Sequence, Tuple

from sqlalchemy import func, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from room_service.app.models import RoomMember, Rooms, Role, JoinRequests


async def get_room_by_id(db: AsyncSession, room_id: int) -> Optional[Rooms]:
    """
    Возвращает комнату по её id.
    :param db: сессия БД
    :param room_id: id комнаты
    :return: найденная комната или None, если не существует
    """
    result = await db.execute(select(Rooms).where(Rooms.id == room_id))
    return result.scalar_one_or_none()


async def create_room(
    db: AsyncSession,
    title: str,
    description: Optional[str],
    player_limit: int,
    cover_image_url: Optional[str],
    master_id: int,
) -> Rooms:
    """
    Создаёт новую комнату.
    :param db: сессия БД
    :param title: название комнаты
    :param description: описание комнаты
    :param player_limit: максимальное количество игроков
    :param cover_image_url: ссылка на обложку комнаты
    :param master_id: id пользователя-мастера
    :return: созданная комната
    """
    room = Rooms(
        title=title,
        description=description,
        player_limit=player_limit,
        cover_image_url=cover_image_url,
        master_id=master_id,
    )
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room


async def update_room(
    db: AsyncSession,
    room: Rooms,
    title: Optional[str],
    description: Optional[str],
    player_limit: Optional[int],
    cover_image_url: Optional[str],
) -> Rooms:
    """
    Обновляет комнату, обновляются только переданные поля.
    :param db: сессия БД
    :param room: обновляемая комната
    :param title: новое название (если None, то не изменяется)
    :param description: новое описание (если None, то не изменяется)
    :param player_limit: новый лимит игроков (если None, то не изменяется)
    :param cover_image_url: новая ссылка на обложку (если None, то не изменяется)
    :return: обновлённая комната
    """
    if title is not None:
        room.title = title
    if description is not None:
        room.description = description
    if player_limit is not None:
        room.player_limit = player_limit
    if cover_image_url is not None:
        room.cover_image_url = cover_image_url

    await db.commit()
    await db.refresh(room)
    return room


async def delete_room(db: AsyncSession, room: Rooms) -> None:
    """
    Удаляет комнату вместе со всеми её участниками и заявками на вступление.
    :param db: сессия БД
    :param room: удаляемая комната
    :return: ничего
    """
    await db.execute(
        delete(RoomMember).where(RoomMember.room_id == room.id)
    )

    await db.execute(
        delete(JoinRequests).where(JoinRequests.room_id == room.id)
    )

    await db.delete(room)
    await db.commit()


async def count_members(db: AsyncSession, room_id: int) -> int:
    """
    Возвращает количество участников комнаты.
    :param db: сессия БД
    :param room_id: id комнаты
    :return: количество участников
    """
    result = await db.execute(
        select(func.count(RoomMember.id)).where(RoomMember.room_id == room_id)
    )
    return result.scalar_one()


async def list_rooms(
    db: AsyncSession,
    limit: Optional[int],
    offset: int = 0,
    sort: Optional[str] = None,
    my_user_id: Optional[int] = None,
    mine_only: bool = False,
    open_only: bool = False,
) -> Tuple[Sequence[Tuple[Rooms, int, str]], int]:
    """
    Возвращает список комнат с пагинацией вместе с числом игроков и именем мастера в каждой.
    :param db: сессия БД
    :param limit: максимальное количество комнат в ответе (если None, то без ограничения)
    :param offset: смещение для пагинации
    :param sort: сортировка ("players", "alphabet" или по умолчанию по дате создания)
    :param my_user_id: id текущего пользователя, используется вместе с mine_only
    :param mine_only: если True, возвращаются только комнаты, где my_user_id является мастером
    :param open_only: если True, возвращаются только комнаты со свободными местами
    :return: кортеж (список строк (комната, число игроков, имя мастера), общее количество комнат)
    """

    member_count_subq = (
        select(
            RoomMember.room_id,
            func.count(RoomMember.id).label("member_count")
        )
        .group_by(RoomMember.room_id)
        .subquery()
    )

    master_subq = (
        select(
            RoomMember.room_id,
            RoomMember.username.label("master_name")
        )
        .where(RoomMember.role == Role.master)
        .subquery()
    )

    current_players_col = func.coalesce(member_count_subq.c.member_count, 0)

    query = (
        select(
            Rooms,
            current_players_col,
            master_subq.c.master_name,
        )
        .outerjoin(
            member_count_subq,
            member_count_subq.c.room_id == Rooms.id,
        )
        .outerjoin(
            master_subq,
            master_subq.c.room_id == Rooms.id,
        )
    )

    if mine_only:
        if my_user_id is None:
            return [], 0
        query = query.where(Rooms.master_id == my_user_id)

    if open_only:
        query = query.where(current_players_col < Rooms.player_limit)

    if sort == "players":
        query = query.order_by(current_players_col.desc())
    elif sort == "alphabet":
        query = query.order_by(Rooms.title.asc())
    else:
        query = query.order_by(Rooms.created_at.desc())

    count_query = (
        select(func.count())
        .select_from(query.subquery())
    )

    total = await db.scalar(count_query)

    if limit is not None:
        query = query.limit(limit)

    query = query.offset(offset)

    result = await db.execute(query)
    rows: List[Tuple[Rooms, int, str]] = list(result.all())

    return rows, total
