import { conFallo } from '../../../../core/errors/AppFailure';
import { guardarBlob } from '../../../../core/network/descargas';
import { ReportesRepository, FiltrosAuditoria, FiltrosReporte } from '../../domain/repositories/ReportesRepository';
import { FormatoReporte } from '../../domain/entities/Reporte';
import { ReportesRemoteDataSource } from '../datasources/ReportesRemoteDataSource';

export class ReportesRepositoryImpl implements ReportesRepository {
  constructor(private readonly remoto: ReportesRemoteDataSource) {}

  dashboard() {
    return conFallo(() => this.remoto.dashboard(), 'No se pudieron cargar las cifras del panel');
  }

  descargar(formato: FormatoReporte, filtros: FiltrosReporte) {
    return conFallo(async () => {
      const res = await this.remoto.descargar(formato, filtros as Record<string, string>);
      guardarBlob(res, `solicitudes_poza_rica.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
    }, `No se pudo generar el reporte ${formato === 'excel' ? 'Excel' : 'PDF'}`);
  }

  auditoria(filtros: FiltrosAuditoria) {
    return conFallo(async () => {
      const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ''));
      const r = await this.remoto.auditoria(params as Record<string, string | number>);
      return { items: r.data, meta: r.meta ?? { total: r.data.length, page: 1, limit: r.data.length || 1, totalPages: 1 } };
    }, 'No se pudo cargar la bitácora');
  }
}
