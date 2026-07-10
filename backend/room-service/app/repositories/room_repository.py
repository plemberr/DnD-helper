from typing import List, Optional, Sequence, Tuple

from sqlalchemy import func, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import RoomMember, Rooms, Role, JoinRequests


# комната по id
async def get_room_by_id(db: AsyncSession, room_id: int) -> Optional[Rooms]:
    result = await db.execute(select(Rooms).where(Rooms.id == room_id))
    return result.scalar_one_or_none()


# создание комнаты
async def create_room(
    db: AsyncSession,
    title: str,
    description: Optional[str],
    player_limit: int,
    cover_image_url: Optional[str],
    master_id: int,
) -> Rooms:
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


# изменение комнаты
async def update_room(
    db: AsyncSession,
    room: Rooms,
    title: Optional[str],
    description: Optional[str],
    player_limit: Optional[int],
    cover_image_url: Optional[str],
) -> Rooms:
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


# удаление комнаты
async def delete_room(db: AsyncSession, room: Rooms) -> None:
    await db.execute(
        delete(RoomMember).where(RoomMember.room_id == room.id)
    )

    await db.execute(
        delete(JoinRequests).where(JoinRequests.room_id == room.id)
    )

    await db.delete(room)
    await db.commit()


# кол-во членов комнаты
async def count_members(db: AsyncSession, room_id: int) -> int:
    result = await db.execute(
        select(func.count(RoomMember.id)).where(RoomMember.room_id == room_id)
    )
    return result.scalar_one()


# лист комнат с пагинацией
async def list_rooms(
    db: AsyncSession,
    limit: Optional[int],
    offset: int = 0,
    sort: Optional[str] = None,
    my_user_id: Optional[int] = None,
    mine_only: bool = False,
    open_only: bool = False,
) -> Tuple[Sequence[Tuple[Rooms, int, str]], int]:

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