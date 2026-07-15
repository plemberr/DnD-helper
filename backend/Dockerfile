FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY common ./common

COPY alembic.ini .
COPY migrations ./migrations

# модули
COPY auth_service ./auth_service
COPY room_service ./room_service
COPY content_service ./content_service
COPY knowledge_service ./knowledge_service

# модели для alembic
RUN mkdir -p services_models

COPY auth_service/app/models ./services_models/auth_service
COPY room_service/app/models ./services_models/room_service
COPY content_service/app/models ./services_models/content_service
COPY knowledge_service/app/models ./services_models/knowledge_service

RUN touch ./services_models/__init__.py \
    && touch ./services_models/auth_service/__init__.py \
    && touch ./services_models/room_service/__init__.py \
    && touch ./services_models/content_service/__init__.py \
    && touch ./services_models/knowledge_service/__init__.py

# запуск процессов
COPY start.sh .
RUN chmod +x start.sh

ENV PYTHONPATH=/app

EXPOSE 8001
EXPOSE 8002
EXPOSE 8003
EXPOSE 8005

CMD ["./start.sh"]