import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type AuthResponseDto, type AuthUserDto } from '../api/authService';
import type { User } from '../types/user';

const USER_STORAGE_KEY = 'dnd-helper-current-user';
const SESSION_STORAGE_KEY = 'dnd-helper-session';

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  nickname: string;
  email: string;
  password: string;
}

interface UpdateProfileData {
  nickname: string;
  email: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  currentUser: User | null;
  isAuthLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    return null;
  }
}

function readStoredSession(): AuthSession | null {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    return rawSession ? (JSON.parse(rawSession) as AuthSession) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(USER_STORAGE_KEY);
}

function saveSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function mapApiUser(user: AuthUserDto): User {
  return {
    id: String(user.id),
    nickname: user.username,
    email: user.email,
    avatarUrl: user.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => readStoredUser());
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const clearAuthState = () => {
    setCurrentUser(null);
    setSession(null);
    saveUser(null);
    saveSession(null);
  };

  const applyAuthResponse = (response: AuthResponseDto) => {
    if (!response.user) {
      throw new Error('Не удалось получить пользователя из ответа auth_service');
    }

    const nextUser = mapApiUser(response.user);
    const nextSession: AuthSession = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tokenType: response.token_type,
    };

    setCurrentUser(nextUser);
    setSession(nextSession);
    saveUser(nextUser);
    saveSession(nextSession);
  };

  useEffect(() => {
    let isCancelled = false;

    const bootstrapAuth = async () => {
      if (!session) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const me = await authService.me(session.accessToken);

        if (isCancelled) {
          return;
        }

        const user = mapApiUser(me);
        setCurrentUser(user);
        saveUser(user);
      } catch {
        try {
          const refreshed = await authService.refresh({ refresh_token: session.refreshToken });
          if (isCancelled) {
            return;
          }

          const nextSession: AuthSession = {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            expiresIn: refreshed.expires_in,
            tokenType: refreshed.token_type,
          };

          const me = await authService.me(nextSession.accessToken);
          if (isCancelled) {
            return;
          }

          const user = mapApiUser(me);
          setSession(nextSession);
          setCurrentUser(user);
          saveSession(nextSession);
          saveUser(user);
        } catch {
          if (isCancelled) {
            return;
          }

          clearAuthState();
        }
      } finally {
        if (!isCancelled) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isCancelled = true;
    };
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthLoading,
      login: async ({ email, password }) => {
        const response = await authService.login({ login: email, password });
        applyAuthResponse(response);
      },
      register: async ({ email, nickname, password }) => {
        const response = await authService.register({
          username: nickname,
          email,
          password,
        });
        applyAuthResponse(response);
      },
      updateProfile: ({ nickname, email, avatarUrl }) => {
        setCurrentUser((user) => {
          if (!user) {
            return null;
          }

          const updatedUser = {
            ...user,
            nickname: nickname.trim(),
            email: email.trim().toLowerCase(),
            avatarUrl,
          };

          saveUser(updatedUser);
          return updatedUser;
        });
      },
      logout: async () => {
        const sessionToRevoke = session;
        clearAuthState();

        if (!sessionToRevoke) {
          return;
        }

        try {
          await authService.logout({
            refresh_token: sessionToRevoke.refreshToken,
            accessToken: sessionToRevoke.accessToken,
          });
        } catch {
          // Ignore network/auth errors: local session already removed.
        }
      },
    }),
    [currentUser, isAuthLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
