import { AppFailure } from '../../../../core/errors/AppFailure';
import { esCorreo, validarPassword } from '../../../../core/utils/validators';
import { AuthRepository, SesionStore } from '../../../auth/domain/repositories/AuthRepository';

export interface FormCredenciales {
  passwordActual: string;
  nuevoEmail: string;
  nuevaPassword: string;
  confirmacion: string;
}

/** Cambia el usuario (correo) y/o la contraseña de la cuenta en sesión. */
export class ActualizarCredencialesUseCase {
  constructor(
    private readonly repo: AuthRepository,
    private readonly store: SesionStore
  ) {}

  async execute(f: FormCredenciales) {
    const email = f.nuevoEmail.trim();
    if (!email && !f.nuevaPassword) throw new AppFailure('Escribe un nuevo usuario, una nueva contraseña o ambos.');
    if (email && !esCorreo(email)) throw new AppFailure('El nuevo usuario debe ser un correo válido.');
    if (f.nuevaPassword) {
      const error = validarPassword(f.nuevaPassword);
      if (error) throw new AppFailure(error);
      if (f.nuevaPassword !== f.confirmacion) throw new AppFailure('La confirmación no coincide con la nueva contraseña.');
    }
    if (!f.passwordActual) throw new AppFailure('Ingresa tu contraseña actual.');

    const user = await this.repo.actualizarCredenciales({
      passwordActual: f.passwordActual,
      nuevoEmail: email || undefined,
      nuevaPassword: f.nuevaPassword || undefined,
    });
    this.store.actualizarUsuario({ email: user.email, debeCambiarPassword: user.debeCambiarPassword });
    return user;
  }
}
