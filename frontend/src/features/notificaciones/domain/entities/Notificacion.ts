export type TipoNotificacion = 'NUEVA_SOLICITUD' | 'CAMBIO_ESTATUS' | 'TURNADO' | 'EVIDENCIA' | 'SISTEMA';

export interface Notificacion {
  _id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  solicitud?: { _id: string; folio: string; estatus: string } | null;
  leida: boolean;
  createdAt: string;
}
