from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from room_service.app import schemas
from room_service.app.db import get_db
from room_service.app.dependencies import get_bearer_token, get_current_user_id, get_optional_user_id
from room_service.app.models import Status
from room_service.app.repositories import join_request_repository, room_member_repository, room_repository
from room_service.app.services import room_service

router = APIRouter(prefix="/rooms", tags=["rooms"])


# создание комнаты
@router.post("", response_model=schemas.RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(
    payload: schemas.RoomCreate,
    user_id: int = Depends(get_current_user_id),
    access_token: str = Depends(get_bearer_token),
    db: AsyncSession = Depends(get_db),
):
    return await room_service.create_room(db, master_id=user_id, access_token=access_token, payload=payload)


# получение списка комнат
@router.get("", response_model=schemas.RoomsListResponse)
async def list_rooms(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    sort: Optional[str] = Query(default=None, pattern="^(created_at|players|alphabet)$"),
    my: bool = Query(default=False),
    open_only: bool = Query(default=False),
    user_id: Optional[int] = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db),
):
    # запрос бд, получаем комнаты, игроков, имя мастера и кол-во комнат
    rows, total = await room_repository.list_rooms(
        db,
        limit=limit,
        offset=offset,
        sort=sort,
        my_user_id=user_id,
        mine_only=my,
        open_only=open_only,
    )

    # разбиваем комнаты по схеме в items
    items = [
        schemas.RoomListItem(
            id=room.id,
            title=room.title,
            description=room.description,
            player_limit=room.player_limit,
            current_players=current_players,
            master_name=master_name or "",
            cover_image_url=room.cover_image_url,
            created_at=room.created_at,
            is_full=current_players >= room.player_limit,
        )
        for room, current_players, master_name in rows
    ]

    return schemas.RoomsListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )

# получить комнату по id
@router.get("/{room_id}", response_model=schemas.RoomDetail)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    room, members = await room_service.get_room_detail(db, room_id)

    return schemas.RoomDetail(
        id=room.id,
        title=room.title,
        description=room.description,
        player_limit=room.player_limit,
        cover_image_url=room.cover_image_url,
        created_at=room.created_at,
        members=[
            schemas.MemberOut(user_id=m.user_id, username=m.username, role=m.role) for m in members
        ],
    )


# изменить комнату по id
@router.patch("/{room_id}", response_model=schemas.RoomUpdateOut)
async def update_room(
    room_id: int,
    payload: schemas.RoomUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id) # проверка на роль мастера

    room = await room_repository.update_room(
        db,
        room,
        title=payload.title,
        description=payload.description,
        player_limit=payload.player_limit,
        cover_image_url=payload.cover_image_url,
    )
    return room


# удаление комнаты по id
@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id)

    await room_repository.delete_room(db, room)


# назначение co-master
@router.post("/{room_id}/co-masters", response_model=schemas.CoMasterOut)
async def assign_co_master(
    room_id: int,
    payload: schemas.CoMasterAssign,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id)

    member = await room_service.assign_co_master(db, room, payload.user_id)
    return schemas.CoMasterOut(room_id=room.id, user_id=member.user_id, role=member.role)


# co-master -> простого игрока
@router.delete("/{room_id}/co-masters/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_co_master(
    room_id: int,
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, current_user_id)

    await room_service.revoke_co_master(db, room, user_id)


# отправка заявки на вступление
@router.post("/{room_id}/requests", response_model=schemas.JoinRequestOut, status_code=status.HTTP_201_CREATED)
async def create_join_request(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    access_token: str = Depends(get_bearer_token),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    request = await room_service.submit_join_request(db, room, user_id, access_token)

    return schemas.JoinRequestOut(
        id=request.id, room_id=request.room_id, user_id=request.user_id, status=request.status
    )


# удаление заявки на вступление
@router.delete("/{room_id}/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_join_request( room_id: int, request_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    await room_service.require_room(db, room_id)

    request = await join_request_repository.get_request_by_id(db, request_id)
    if request is None or request.room_id != room_id:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    if request.user_id != user_id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    await join_request_repository.delete_request(db, request)


# получение заявок на вступление мастером
@router.get("/{room_id}/requests", response_model=schemas.JoinRequestsListResponse)
async def list_join_requests(
    room_id: int,
    status_filter: Optional[Status] = Query(default=None, alias="status"),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id)

    requests = await join_request_repository.list_requests(db, room_id, status=status_filter)

    items = [
        schemas.JoinRequestListItem(
            id=r.id, room_id=r.room_id, user_id=r.user_id, username=r.username,
            status=r.status, created_at=r.created_at,
        )
        for r in requests
    ]
    return schemas.JoinRequestsListResponse(items=items)


# изменение статуса заявки мастером
@router.patch("/{room_id}/requests/{request_id}", response_model=schemas.JoinRequestProcessedOut)
async def process_join_request(
    room_id: int,
    request_id: int,
    payload: schemas.JoinRequestUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id)

    if payload.status not in (Status.accepted, Status.rejected):
        raise HTTPException(status_code=400, detail="Некорректный статус")

    request = await join_request_repository.get_request_by_id(db, request_id)
    if request is None or request.room_id != room_id:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    request = await room_service.process_join_request(db, room, request, payload.status)

    return schemas.JoinRequestProcessedOut(
        id=request.id, room_id=request.room_id, user_id=request.user_id, status=request.status
    )


# получение участников комнаты
@router.get("/{room_id}/members", response_model=schemas.MembersListResponse)
async def list_members(room_id: int, db: AsyncSession = Depends(get_db)):
    await room_service.require_room(db, room_id)
    members = await room_member_repository.list_members(db, room_id)

    items = [schemas.MemberOut(user_id=m.user_id, username=m.username, role=m.role) for m in members]
    return schemas.MembersListResponse(items=items)


# покинуть комнату
@router.delete("/{room_id}/members/me", status_code=status.HTTP_204_NO_CONTENT)
async def leave_room(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    await room_service.leave_room(db, room, user_id)


# выгнать игрока из комнаты
@router.delete("/{room_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def kick_member(
    room_id: int,
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, current_user_id)

    await room_service.kick_member(db, room, user_id)
