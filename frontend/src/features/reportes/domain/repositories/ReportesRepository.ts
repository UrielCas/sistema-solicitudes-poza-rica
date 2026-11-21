import { Pagina } from '../../../../shared/types/ApiResponse';
import { DashboardStats, FormatoReporte, RegistroAuditoria } from '../entities/Reporte';

export interface FiltrosReporte {
  anio?: string;
  estatus?: string;
  areaActual?: string;
  zona?: string;
  search?: string;
}

export interface FiltrosAuditoria {
  accion?: string;
  recursoId?: string;
  page?: number;
  limit?: number;
}

export interface ReportesRepository {
  dashboard(): Promise<DashboardStats>;
  descargar(formato: FormatoReporte, filtros: FiltrosReporte): Promise<void>;
  auditoria(filtros: FiltrosAuditoria): Promise<Pagina<RegistroAuditoria>>;
}
