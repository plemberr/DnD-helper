from fastapi import FastAPI

from character_service.app.routers import characters

app = FastAPI(
    title="Character Service",
    description="Листы персонажей и навыки",
    version="1.0.0",
)

app.include_router(characters.router, prefix="/api")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
