const AUTH_SESSION_STORAGE_KEY = 'dnd-helper-session';

interface StoredSession {
  accessToken: string;
}

export function readAccessToken(): string | null {
  try {
    const rawSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    const parsed = JSON.parse(rawSession) as StoredSession;

    if (typeof parsed.accessToken === 'string' && parsed.accessToken.trim()) {
      return parsed.accessToken;
    }

    return null;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2 || !parts[1]) {
      return null;
    }

    const normalizedBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = normalizedBase64.padEnd(
      normalizedBase64.length + ((4 - (normalizedBase64.length % 4)) % 4),
      '=',
    );

    const payload = atob(paddedBase64);
    const parsed = JSON.parse(payload) as Record<string, unknown>;
    return parsed;
  } catch {
    return null;
  }
}

export function readCurrentUserId(): number | null {
  const accessToken = readAccessToken();
  if (!accessToken) {
    return null;
  }

  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    return null;
  }

  const sub = payload.sub;
  if (typeof sub === 'number' && Number.isFinite(sub)) {
    return sub;
  }

  if (typeof sub === 'string' && sub.trim()) {
    const parsed = Number.parseInt(sub, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}
