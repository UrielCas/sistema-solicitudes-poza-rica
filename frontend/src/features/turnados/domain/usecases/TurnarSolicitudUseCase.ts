import { AppFailure } from '../../../../core/errors/AppFailure';
import { TurnadosRepository } from '../repositories/TurnadosRepository';

/** Turna la solicitud a otra dependencia con instrucciones. */
export class TurnarSolicitudUseCase {
  constructor(private readonly repo: TurnadosRepository) {}

  execute(datos: { solicitudId: string; areaActual?: string | null; areaDestino: string; instrucciones: string }) {
    if (!datos.areaDestino) throw new AppFailure('Selecciona el área destino.');
    if (datos.areaDestino === datos.areaActual) throw new AppFailure('La solicitud ya está en esa área.');
    if (datos.instrucciones.trim().length < 5) throw new AppFailure('Escribe instrucciones claras para el área (mínimo 5 caracteres).');
    return this.repo.turnar(datos.solicitudId, datos.areaDestino, datos.instrucciones.trim());
  }
}
