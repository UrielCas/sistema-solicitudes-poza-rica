import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sesion, User } from '../../domain/entities/User';
import { SesionStore } from '../../domain/repositories/AuthRepository';

export type { User } from '../../domain/entities/User';
export { esAdmin as isAdmin, rutaInicio as homePathFor } from '../../domain/entities/User';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

/** Estado de sesión (persistido en localStorage). Equivale al AuthNotifier de la versión Flutter. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      updateUser: (partial) => set((state) => (state.user ? { user: { ...state.user, ...partial } } : state)),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'poza-rica-auth' }
  )
);

/** Adaptador del store al puerto SesionStore que usan los casos de uso. */
export const sesionStore: SesionStore = {
  guardar: (s: Sesion) => useAuthStore.getState().setSession(s.user, s.accessToken, s.refreshToken),
  actualizarUsuario: (parcial) => useAuthStore.getState().updateUser(parcial),
  limpiar: () => useAuthStore.getState().logout(),
};
