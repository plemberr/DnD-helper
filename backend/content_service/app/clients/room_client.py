import httpx
from fastapi import HTTPException, status

from content_service.app.config import settings


async def fetch_room_master_id(room_id: int) -> int:
    """
    Запрашивает у room_service список участников комнаты и возвращает id мастера.
    :param room_id: id комнаты, чей мастер запрашивается
    :return: id пользователя-мастера этой комнаты
    """
    async with httpx.AsyncClient(timeout=settings.room_service_timeout_seconds) as client:
        try:
            response = await client.get(f"{settings.room_service_url}/rooms/{room_id}/members")
        except httpx.RequestError:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Room service недоступен")

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комната не найдена")
    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Не удалось получить данные комнаты")

    for member in response.json()["items"]:
        if member["role"] == "master":
            return member["user_id"]

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Мастер комнаты не найден")