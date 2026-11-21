import { AppError } from '../../core/errors/AppError';
import { EstatusSolicitud } from './solicitudes.model';

/**
 * Estatus de la bandeja de seguimiento del Administrador:
 * PENDIENTE · EN PROCESO · ATENDIDO (ATENDIDA) · NO PROCEDE (RECHAZADA).
 * Entre estos cuatro el Administrador puede moverse libremente (p. ej. reabrir).
 */
export const ESTATUS_BANDEJA: EstatusSolicitud[] = ['PENDIENTE', 'EN_PROCESO', 'ATENDIDA', 'RECHAZADA'];

const TRANSICIONES: Record<EstatusSolicitud, EstatusSolicitud[]> = {
  PENDIENTE: ['TURNADA', 'EN_PROCESO', 'ATENDIDA', 'RECHAZADA'],
  RECIBIDA: ['PENDIENTE', 'TURNADA', 'EN_PROCESO', 'ATENDIDA', 'RECHAZADA'],
  TURNADA: ['PENDIENTE', 'EN_PROCESO', 'TURNADA', 'ATENDIDA', 'RECHAZADA'],
  EN_PROCESO: ['PENDIENTE', 'ATENDIDA', 'TURNADA', 'RECHAZADA'],
  ATENDIDA: ['CERRADA', 'EN_PROCESO', 'PENDIENTE', 'RECHAZADA'],
  RECHAZADA: ['CERRADA', 'PENDIENTE', 'EN_PROCESO', 'ATENDIDA'],
  CERRADA: [],
};

export const validarTransicion = (actual: EstatusSolicitud, nuevo: EstatusSolicitud) => {
  if (!TRANSICIONES[actual]?.includes(nuevo)) {
    throw new AppError(`No se puede pasar de ${actual} a ${nuevo}`, 400);
  }
};