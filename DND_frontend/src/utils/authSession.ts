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
