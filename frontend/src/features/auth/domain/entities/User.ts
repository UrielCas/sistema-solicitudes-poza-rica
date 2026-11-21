export type Rol = 'SUPERADMIN' | 'DIRECTOR_AREA' | 'OPERADOR' | 'VENTANILLA';

export interface AreaRef {
  _id: string;
  nombre: string;
  siglas: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  area?: AreaRef;
  debeCambiarPassword?: boolean;
}

export interface Sesion {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const esAdmin = (user?: User | null) => user?.rol === 'SUPERADMIN';

/** Pantalla de inicio según el rol: el Administrador al panel, las áreas a capturar. */
export const rutaInicio = (user?: User | null) => (esAdmin(user) ? '/dashboard' : '/solicitudes/nueva');
