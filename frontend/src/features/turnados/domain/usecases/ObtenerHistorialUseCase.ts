import { TurnadosRepository } from '../repositories/TurnadosRepository';

/** Historial de turnados de una solicitud (más reciente primero). */
export class ObtenerHistorialUseCase {
  constructor(private readonly repo: TurnadosRepository) {}

  execute(solicitudId: string) {
    return this.repo.historial(solicitudId);
  }
}
