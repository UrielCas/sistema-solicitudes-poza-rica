import { ReportesRepository, FiltrosAuditoria, FiltrosReporte } from '../repositories/ReportesRepository';
import { DashboardStats, FormatoReporte } from '../entities/Reporte';

/** Cifras del panel, agrupadas como las muestra el dashboard. */
export class ObtenerDashboardUseCase {
  constructor(private readonly repo: ReportesRepository) {}

  async execute() {
    const s: DashboardStats = await this.repo.dashboard();
    const e = s.porEstatus;
    return {
      ...s,
      resumen: {
        atendidas: (e.ATENDIDA ?? 0) + (e.CERRADA ?? 0),
        enProceso: (e.EN_PROCESO ?? 0) + (e.TURNADA ?? 0),
        pendientes: (e.PENDIENTE ?? 0) + (e.RECIBIDA ?? 0),
        noProcede: e.RECHAZADA ?? 0,
      },
    };
  }
}

/** Descarga el reporte en Excel o PDF con los filtros del listado. */
export class ExportarReporteUseCase {
  constructor(private readonly repo: ReportesRepository) {}

  execute(formato: FormatoReporte, filtros: FiltrosReporte = {}) {
    const limpios = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')) as FiltrosReporte;
    return this.repo.descargar(formato, limpios);
  }
}

/** Bitácora de acciones críticas. */
export class ConsultarAuditoriaUseCase {
  constructor(private readonly repo: ReportesRepository) {}

  execute(filtros: FiltrosAuditoria) {
    return this.repo.auditoria({ limit: 25, ...filtros, page: filtros.page ?? 1 });
  }
}
