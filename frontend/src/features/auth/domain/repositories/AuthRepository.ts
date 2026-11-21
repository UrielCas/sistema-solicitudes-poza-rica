import { AreaLogin } from '../entities/Area';
import { Sesion, User } from '../entities/User';

export interface CambioCredenciales {
  passwordActual: string;
  nuevoEmail?: string;
  nuevaPassword?: string;
}

/** Contrato que la capa de datos debe cumplir (la presentación solo conoce esto). */
export interface AuthRepository {
  obtenerAreasLogin(): Promise<AreaLogin[]>;
  loginPorArea(areaId: string, password: string): Promise<Sesion>;
  loginAdministrador(email: string, password: string): Promise<Sesion>;
  actualizarCredenciales(cambio: CambioCredenciales): Promise<User>;
}

/** Dónde se guarda la sesión (lo implementa el store de presentación). */
export interface SesionStore {
  guardar(sesion: Sesion): void;
  actualizarUsuario(parcial: Partial<User>): void;
  limpiar(): void;
}
