from fastapi import FastAPI

from room_service.app.routers import rooms

app = FastAPI(
    title="Room Service",
    description="Комнаты, участники и заявки на вступление",
    version="1.1.0",
)

app.include_router(rooms.router, prefix="/api")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
