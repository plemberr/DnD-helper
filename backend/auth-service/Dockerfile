FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY auth-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY common ./common
COPY auth-service/app ./app
COPY auth-service/keys ./keys

ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
