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


@router.post("", response_model=schemas.RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(
    payload: schemas.RoomCreate,
    user_id: int = Depends(get_current_user_id),
    access_token: str = Depends(get_bearer_token),
    db: AsyncSession = Depends(get_db),
):
    """
    Создаёт комнату. Текущий пользователь становится её мастером.
    :param payload: данные создаваемой комнаты
    :param user_id: id текущего пользователя (подставляется из токена)
    :param access_token: access-токен текущего пользователя
    :param db: сессия БД
    :return: созданная комната (RoomOut)
    """
    return await room_service.create_room(db, master_id=user_id, access_token=access_token, payload=payload)


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
    """
    Возвращает список комнат с пагинацией, сортировкой и фильтрами.
    :param limit: максимальное количество комнат в ответе
    :param offset: смещение для пагинации
    :param sort: сортировка ("created_at", "players" или "alphabet")
    :param my: если True, возвращаются только комнаты текущего пользователя (требует авторизации)
    :param open_only: если True, возвращаются только комнаты со свободными местами
    :param user_id: id текущего пользователя (если авторизован)
    :param db: сессия БД
    :return: список комнат с пагинацией (RoomsListResponse)
    """
    rows, total = await room_repository.list_rooms(
        db,
        limit=limit,
        offset=offset,
        sort=sort,
        my_user_id=user_id,
        mine_only=my,
        open_only=open_only,
    )

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


@router.get("/{room_id}", response_model=schemas.RoomDetail)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    """
    Возвращает комнату вместе со списком её участников.
    :param room_id: id комнаты
    :param db: сессия БД
    :return: подробная информация о комнате (RoomDetail)
    """
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


@router.patch("/{room_id}", response_model=schemas.RoomUpdateOut)
async def update_room(
    room_id: int,
    payload: schemas.RoomUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Изменяет комнату (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param payload: новые данные комнаты (обновляются только переданные поля)
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: обновлённая комната (RoomUpdateOut)
    """
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id)  # проверка на роль мастера

    room = await room_repository.update_room(
        db,
        room,
        title=payload.title,
        description=payload.description,
        player_limit=payload.player_limit,
        cover_image_url=payload.cover_image_url,
    )
    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаляет комнату (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id)

    await room_repository.delete_room(db, room)


@router.post("/{room_id}/co-masters", response_model=schemas.CoMasterOut)
async def assign_co_master(
    room_id: int,
    payload: schemas.CoMasterAssign,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Назначает участника комнаты co-мастером (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param payload: id пользователя, назначаемого co-мастером
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: результат назначения (CoMasterOut)
    """
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id)

    member = await room_service.assign_co_master(db, room, payload.user_id)
    return schemas.CoMasterOut(room_id=room.id, user_id=member.user_id, role=member.role)


@router.delete("/{room_id}/co-masters/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_co_master(
    room_id: int,
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Снимает роль co-мастера с участника комнаты (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param user_id: id участника, у которого снимается роль
    :param current_user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, current_user_id)

    await room_service.revoke_co_master(db, room, user_id)


@router.post("/{room_id}/requests", response_model=schemas.JoinRequestOut, status_code=status.HTTP_201_CREATED)
async def create_join_request(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    access_token: str = Depends(get_bearer_token),
    db: AsyncSession = Depends(get_db),
):
    """
    Отправляет заявку на вступление в комнату.
    :param room_id: id комнаты
    :param user_id: id текущего пользователя (подставляется из токена)
    :param access_token: access-токен текущего пользователя
    :param db: сессия БД
    :return: созданная заявка (JoinRequestOut)
    """
    room = await room_service.require_room(db, room_id)
    request = await room_service.submit_join_request(db, room, user_id, access_token)

    return schemas.JoinRequestOut(
        id=request.id, room_id=request.room_id, user_id=request.user_id, status=request.status
    )


@router.delete("/{room_id}/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_join_request(
    room_id: int,
    request_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Отзывает собственную заявку на вступление.
    :param room_id: id комнаты
    :param request_id: id заявки
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    await room_service.require_room(db, room_id)

    request = await join_request_repository.get_request_by_id(db, request_id)
    if request is None or request.room_id != room_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена")

    if request.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")

    await join_request_repository.delete_request(db, request)


@router.get("/{room_id}/requests", response_model=schemas.JoinRequestsListResponse)
async def list_join_requests(
    room_id: int,
    status_filter: Optional[Status] = Query(default=None, alias="status"),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает список заявок на вступление в комнату (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param status_filter: фильтр по статусу заявки
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: список заявок (JoinRequestsListResponse)
    """
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


@router.patch("/{room_id}/requests/{request_id}", response_model=schemas.JoinRequestOut)
async def process_join_request(
    room_id: int,
    request_id: int,
    payload: schemas.JoinRequestUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Принимает или отклоняет заявку на вступление (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param request_id: id заявки
    :param payload: новый статус заявки (accepted или rejected)
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: обработанная заявка (JoinRequestOut)
    """
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, user_id)

    if payload.status not in (Status.accepted, Status.rejected):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Некорректный статус")

    request = await join_request_repository.get_request_by_id(db, request_id)
    if request is None or request.room_id != room_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена")

    request = await room_service.process_join_request(db, room, request, payload.status)

    return schemas.JoinRequestOut(
        id=request.id, room_id=request.room_id, user_id=request.user_id, status=request.status
    )


@router.get("/{room_id}/members", response_model=schemas.MembersListResponse)
async def list_members(room_id: int, db: AsyncSession = Depends(get_db)):
    """
    Возвращает список участников комнаты.
    :param room_id: id комнаты
    :param db: сессия БД
    :return: список участников (MembersListResponse)
    """
    await room_service.require_room(db, room_id)
    members = await room_member_repository.list_members(db, room_id)

    items = [schemas.MemberOut(user_id=m.user_id, username=m.username, role=m.role) for m in members]
    return schemas.MembersListResponse(items=items)


@router.delete("/{room_id}/members/me", status_code=status.HTTP_204_NO_CONTENT)
async def leave_room(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Позволяет текущему пользователю покинуть комнату.
    :param room_id: id комнаты
    :param user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    room = await room_service.require_room(db, room_id)
    await room_service.leave_room(db, room, user_id)


@router.delete("/{room_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def kick_member(
    room_id: int,
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Исключает участника из комнаты (доступно только мастеру комнаты).
    :param room_id: id комнаты
    :param user_id: id исключаемого участника
    :param current_user_id: id текущего пользователя (подставляется из токена)
    :param db: сессия БД
    :return: ничего (204 No Content)
    """
    room = await room_service.require_room(db, room_id)
    room_service.require_master(room, current_user_id)

    await room_service.kick_member(db, room, user_id)
