import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'SUPERADMIN' | 'DIRECTOR_AREA' | 'OPERADOR' | 'VENTANILLA';
  area?: { _id: string; nombre: string; siglas: string };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'poza-rica-auth' }
  )
);