import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types/user';

const STORAGE_KEY = 'dnd-helper-current-user';

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
  login: (data: LoginData) => void;
  register: (data: RegisterData) => void;
  updateProfile: (data: UpdateProfileData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

function createDemoUser(email: string, nickname?: string): User {
  const normalizedEmail = email.trim().toLowerCase();
  const fallbackNickname = normalizedEmail.split('@')[0] || 'Игрок';

  return {
    id: crypto.randomUUID(),
    nickname: nickname?.trim() || fallbackNickname,
    email: normalizedEmail,
    avatarUrl: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      login: ({ email }) => {
        const user = createDemoUser(email);
        setCurrentUser(user);
        saveUser(user);
      },
      register: ({ email, nickname }) => {
        const user = createDemoUser(email, nickname);
        setCurrentUser(user);
        saveUser(user);
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
      logout: () => {
        setCurrentUser(null);
        saveUser(null);
      },
    }),
    [currentUser],
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
