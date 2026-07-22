from fastapi import FastAPI

from auth_service.app.routers import auth

app = FastAPI(
    title="Auth Service",
    description="JWT (RS256) authentication microservice: access + refresh tokens",
    version="1.1.0",
)

app.include_router(auth.router, prefix="/api")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
