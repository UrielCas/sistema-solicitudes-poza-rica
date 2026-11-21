export interface DashboardStats {
  total: number;
  porEstatus: Record<string, number>;
  porArea: { _id: string; total: number }[];
}

export type FormatoReporte = 'excel' | 'pdf';

export interface RegistroAuditoria {
  _id: string;
  accion: string;
  usuario?: { _id: string; nombre: string; email: string } | null;
  rol?: string;
  area?: { _id: string; nombre: string; siglas: string } | null;
  metodo?: string;
  ruta?: string;
  recursoId?: string;
  status?: number;
  ip?: string;
  detalle?: Record<string, unknown>;
  createdAt: string;
}

/** Nombre legible de cada acción de la bitácora. */
export const ETIQUETA_ACCION: Record<string, string> = {
  LOGIN_OK: 'Inicio de sesión',
  LOGIN_FALLIDO: 'Intento de acceso fallido',
  CREDENCIALES_ACTUALIZADAS: 'Cambio de credenciales',
  USUARIO_CREADO: 'Alta de usuario',
  AREA_CREADA: 'Alta de dependencia',
  SOLICITUD_CREADA: 'Solicitud registrada',
  ESTATUS_CAMBIADO: 'Cambio de estatus',
  SOLICITUD_TURNADA: 'Solicitud turnada',
  EVIDENCIA_AGREGADA: 'Evidencia agregada',
  EVIDENCIA_ELIMINADA: 'Evidencia eliminada',
  CATALOGO_CREADO: 'Valor de catálogo agregado',
  CATALOGO_ACTUALIZADO: 'Catálogo modificado',
  REPORTE_EXCEL: 'Descarga de Excel',
  REPORTE_PDF: 'Descarga de PDF',
};
