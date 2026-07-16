const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL ?? '/api/auth';

interface AuthUserDto {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
}

interface AuthTokensDto {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface AuthResponseDto extends AuthTokensDto {
  user: AuthUserDto | null;
}

interface RefreshResponseDto extends AuthTokensDto {}

interface ApiErrorBody {
  detail?: string;
}

async function parseError(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === 'string' && body.detail.trim()) {
      message = body.detail;
    }
  } catch {
    // Intentionally ignored: fallback error message is used.
  }

  throw new Error(message);
}

async function request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    return parseError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const authService = {
  login(payload: { login: string; password: string }) {
    return request<AuthResponseDto>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  register(payload: { username: string; email: string; password: string }) {
    return request<AuthResponseDto>('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  refresh(payload: { refresh_token: string }) {
    return request<RefreshResponseDto>('/refresh', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout(payload: { refresh_token: string; accessToken: string }) {
    return request<void>('/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: payload.refresh_token }),
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });
  },

  me(accessToken: string) {
    return request<AuthUserDto>('/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};

export type { AuthResponseDto, AuthUserDto, AuthTokensDto };
