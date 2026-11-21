import { AppFailure } from '../../../../core/errors/AppFailure';
import { esCorreo } from '../../../../core/utils/validators';
import { AuthRepository, SesionStore } from '../repositories/AuthRepository';
import { Sesion } from '../entities/User';

export type Credenciales =
  | { modo: 'AREA'; areaId?: string; password: string }
  | { modo: 'ADMIN'; email: string; password: string };

export class LoginUseCase {
  constructor(
    private readonly repo: AuthRepository,
    private readonly store: SesionStore
  ) {}

  async execute(c: Credenciales): Promise<Sesion> {
    if (!c.password) throw new AppFailure('Ingresa tu contraseña.');
    let sesion: Sesion;
    if (c.modo === 'AREA') {
      if (!c.areaId) throw new AppFailure('Selecciona tu dirección de la lista.');
      sesion = await this.repo.loginPorArea(c.areaId, c.password);
    } else {
      if (!esCorreo(c.email)) throw new AppFailure('Escribe un correo electrónico válido.');
      sesion = await this.repo.loginAdministrador(c.email.trim(), c.password);
    }
    this.store.guardar(sesion);
    return sesion;
  }
}
