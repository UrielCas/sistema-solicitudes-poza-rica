/** Estatus de una solicitud tal como los maneja la API. */
export type EstatusSolicitud =
  | 'PENDIENTE'
  | 'RECIBIDA'
  | 'TURNADA'
  | 'EN_PROCESO'
  | 'ATENDIDA'
  | 'RECHAZADA'
  | 'CERRADA';

/** Los cuatro estatus de la bandeja de seguimiento del Administrador. */
export const ESTATUS_BANDEJA: EstatusSolicitud[] = ['PENDIENTE', 'EN_PROCESO', 'ATENDIDA', 'RECHAZADA'];

export const ETIQUETA_ESTATUS: Record<EstatusSolicitud, string> = {
  PENDIENTE: 'PENDIENTE',
  RECIBIDA: 'RECIBIDA',
  TURNADA: 'TURNADA',
  EN_PROCESO: 'EN PROCESO',
  ATENDIDA: 'ATENDIDO',
  RECHAZADA: 'NO PROCEDE',
  CERRADA: 'CERRADA',
};

/** Clases de Tailwind del chip de cada estatus. */
export const COLOR_ESTATUS: Record<EstatusSolicitud, string> = {
  PENDIENTE: 'bg-red-100 text-red-800',
  RECIBIDA: 'bg-slate-100 text-slate-700',
  TURNADA: 'bg-guinda-claro text-guinda',
  EN_PROCESO: 'bg-amber-100 text-amber-800',
  ATENDIDA: 'bg-emerald-100 text-emerald-700',
  RECHAZADA: 'bg-slate-200 text-slate-700',
  CERRADA: 'bg-purple-100 text-purple-700',
};

export const etiquetaEstatus = (estatus: string) =>
  ETIQUETA_ESTATUS[estatus as EstatusSolicitud] || estatus.replace(/_/g, ' ');

export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
