import { SesionStore } from '../repositories/AuthRepository';

/**
 * Cierra la sesión: borra los tokens y la caché de datos, para que la siguiente
 * cuenta que entre en el mismo equipo no vea información de la anterior.
 */
export class LogoutUseCase {
  constructor(
    private readonly store: SesionStore,
    private readonly limpiarCache: () => void
  ) {}

  execute() {
    this.store.limpiar();
    this.limpiarCache();
  }
}
