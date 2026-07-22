from fastapi import FastAPI

from knowledge_service.app.routers import skills

app = FastAPI(
    title="Knowledge Base Service",
    description="Справочник навыков",
    version="0.1.0",
)

app.include_router(skills.router, prefix="/api")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
