import httpx
from fastapi import HTTPException

from content_service.app.config import settings


# получение id мастера комнаты через room_service
async def fetch_room_master_id(room_id: int) -> int:
    async with httpx.AsyncClient(timeout=settings.room_service_timeout_seconds) as client:
        try:
            response = await client.get(f"{settings.room_service_url}/rooms/{room_id}/members")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Room service недоступен")

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Комната не найдена")
    if response.status_code != 200:
        raise HTTPException(status_code=503, detail="Не удалось получить данные комнаты")

    for member in response.json()["items"]:
        if member["role"] == "master":
            return member["user_id"]

    raise HTTPException(status_code=404, detail="Мастер комнаты не найден")