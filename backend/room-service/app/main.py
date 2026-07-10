from fastapi import FastAPI

from app.routers import rooms

app = FastAPI(
    title="Room Service",
    description="Комнаты, участники и заявки на вступление",
    version="1.1.0",
)

app.include_router(rooms.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
