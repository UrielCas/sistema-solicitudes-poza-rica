import { AppFailure } from '../../../../core/errors/AppFailure';
import { ESTATUS_BANDEJA } from '../../../../core/constants/estatus';
import { SolicitudesRepository } from '../repositories/SolicitudesRepository';
import { EstatusSolicitud, Solicitud } from '../entities/Solicitud';

/** Bandeja de seguimiento: PENDIENTE · EN PROCESO · ATENDIDO · NO PROCEDE. */
export class CambiarEstatusUseCase {
  constructor(private readonly repo: SolicitudesRepository) {}

  puedeCambiar(s: Solicitud, nuevo: EstatusSolicitud) {
    return s.estatus !== 'CERRADA' && s.estatus !== nuevo && ESTATUS_BANDEJA.includes(nuevo);
  }

  execute(s: Solicitud, nuevo: EstatusSolicitud) {
    if (!this.puedeCambiar(s, nuevo)) throw new AppFailure('Ese cambio de estatus no está permitido.');
    return this.repo.cambiarEstatus(s._id, nuevo);
  }
}
