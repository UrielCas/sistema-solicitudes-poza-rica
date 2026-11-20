import { AppError } from '../../core/errors/AppError';
import { EstatusSolicitud } from './solicitudes.model';

const TRANSICIONES: Record<EstatusSolicitud, EstatusSolicitud[]> = {
  PENDIENTE: ['TURNADA', 'EN_PROCESO', 'ATENDIDA', 'RECHAZADA'],
  RECIBIDA: ['PENDIENTE', 'TURNADA', 'RECHAZADA'],
  TURNADA: ['EN_PROCESO', 'TURNADA', 'ATENDIDA', 'RECHAZADA'],
  EN_PROCESO: ['ATENDIDA', 'TURNADA', 'PENDIENTE'],
  ATENDIDA: ['CERRADA', 'EN_PROCESO'],
  RECHAZADA: ['CERRADA'],
  CERRADA: [],
};

export const validarTransicion = (actual: EstatusSolicitud, nuevo: EstatusSolicitud) => {
  if (!TRANSICIONES[actual]?.includes(nuevo)) {
    throw new AppError(`No se puede pasar de ${actual} a ${nuevo}`, 400);
  }
};