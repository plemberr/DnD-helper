import uuid
from pathlib import Path

from fastapi import UploadFile

from content_service.app.config import settings

STORAGE_ROOT = Path(settings.media_storage_path)
STORAGE_ROOT.mkdir(parents=True, exist_ok=True)


async def save_upload(file: UploadFile, subfolder: str) -> tuple[str, int]:
    """
    Сохраняет загруженный файл на диск в media_storage.
    Оригинальное имя файла не сохраняется как имя на диске, вместо него генерируется
    уникальное имя на основе uuid4 с сохранением исходного расширения.
    :param file: файл, полученный FastAPI из multipart/form-data
    :param subfolder: относительный путь внутри media_storage
    :return: кортеж (public_url - публичная ссылка на файл, size - размер файла в байтах)
    """
    target_dir = STORAGE_ROOT / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "").suffix  # получение исходного расширения
    stored_name = f"{uuid.uuid4().hex}{ext}"  # генерация нового уникального имени
    path = target_dir / stored_name

    size = 0
    with open(path, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            f.write(chunk)  # записываем текущую часть файла в новый файл на диске

    url = f"{settings.media_public_base_url}/{subfolder}/{stored_name}"
    return url, size


def delete_file(file_url: str | None) -> None:
    """
    Удаляет физический файл на диске по его публичному URL, если он там вообще есть.
    Если file_url ведёт не на media_storage, функция ничего не делает,
    так как удалять на диске нечего.
    :param file_url: публичный URL файла (значение поля file_url из MediaFile), может быть None
    :return: ничего
    """
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