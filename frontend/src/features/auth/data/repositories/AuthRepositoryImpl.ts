import { conFallo } from '../../../../core/errors/AppFailure';
import { AuthRepository, CambioCredenciales } from '../../domain/repositories/AuthRepository';
import { Rol, Sesion, User } from '../../domain/entities/User';
import { AuthRemoteDataSource, SesionDTO, UserDTO } from '../datasources/AuthRemoteDataSource';

const aUsuario = (u: UserDTO): User => ({
  id: String(u.id),
  nombre: u.nombre,
  email: u.email,
  rol: u.rol as Rol,
  // Solo se conserva el área cuando viene completa (populate); un id suelto no sirve a la UI.
  area: u.area && typeof u.area === 'object' ? u.area : undefined,
  debeCambiarPassword: !!u.debeCambiarPassword,
});

const aSesion = (s: SesionDTO): Sesion => ({
  user: aUsuario(s.user),
  accessToken: s.accessToken,
  refreshToken: s.refreshToken,
});

/** Implementación con la API REST: traduce DTOs a entidades y errores a AppFailure. */
export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly remoto: AuthRemoteDataSource) {}

  obtenerAreasLogin() {
    return conFallo(() => this.remoto.areasLogin(), 'No se pudo cargar el catálogo de direcciones');
  }

  loginPorArea(areaId: string, password: string) {
    return conFallo(async () => aSesion(await this.remoto.login({ areaId, password })), 'Error al iniciar sesión');
  }

  loginAdministrador(email: string, password: string) {
    return conFallo(async () => aSesion(await this.remoto.login({ email, password })), 'Error al iniciar sesión');
  }

  actualizarCredenciales(c: CambioCredenciales) {
    return conFallo(async () => aUsuario(await this.remoto.credenciales(c)), 'No se pudieron actualizar las credenciales');
  }
}
