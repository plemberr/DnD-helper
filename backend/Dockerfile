FROM python:3.12-slim as base

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# общее
COPY common ./common
ENV PYTHONPATH=/app

# мигратор

FROM base as migrator

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY migrations ./migrations

RUN mkdir -p services_models
COPY auth-service/app/models ./services_models/auth_service

RUN touch ./services_models/__init__.py \
    && find ./services_models -mindepth 1 -maxdepth 1 -type d -exec sh -c 'touch "$1/__init__.py"' _ {} \;

CMD ["alembic", "upgrade", "head"]

# auth-service

FROM base as auth-service

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY auth-service/app ./app
COPY auth-service/keys ./keys

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]