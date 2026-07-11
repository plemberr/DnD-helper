import uuid
from pathlib import Path

from fastapi import UploadFile

from content_service.app.config import settings

STORAGE_ROOT = Path(settings.media_storage_path)
STORAGE_ROOT.mkdir(parents=True, exist_ok=True)


async def save_upload(file: UploadFile, subfolder: str) -> tuple[str, int]:
    # cохраняем файл на диск, возвращает (public_url, size_bytes)
    target_dir = STORAGE_ROOT / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "").suffix # получение исходного расширения
    stored_name = f"{uuid.uuid4().hex}{ext}" # генерация нового уникального имени
    path = target_dir / stored_name

    size = 0
    with open(path, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            f.write(chunk) # записываем текущю часть файла в новый файл на диске

    url = f"{settings.media_public_base_url}/{subfolder}/{stored_name}"
    return url, size


def delete_file(file_url: str | None) -> None:
    # удаляем физический файл на диске по его public_url (если он вообще был на диске)
    if not file_url:
        return
    if not file_url.startswith(settings.media_public_base_url):
        return

    relative = file_url[len(settings.media_public_base_url):].lstrip("/")
    path = STORAGE_ROOT / relative

    try:
        if path.is_file():
            path.unlink()
    except OSError:
        pass