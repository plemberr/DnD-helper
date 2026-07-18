const ACTIVE_ADMIN_ROOM_ID_KEY = 'dnd-helper-active-admin-room-id';

export function saveActiveAdminRoomId(roomId: number) {
  localStorage.setItem(ACTIVE_ADMIN_ROOM_ID_KEY, String(roomId));
}

export function readActiveAdminRoomId(): number | null {
  const rawValue = localStorage.getItem(ACTIVE_ADMIN_ROOM_ID_KEY);

  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
