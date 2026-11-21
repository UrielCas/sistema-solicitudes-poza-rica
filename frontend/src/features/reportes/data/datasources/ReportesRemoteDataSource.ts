import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../../../shared/types/ApiResponse';
import { DashboardStats, FormatoReporte, RegistroAuditoria } from '../../domain/entities/Reporte';

export class ReportesRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  async dashboard() {
    return (await this.http.get<ApiResponse<DashboardStats>>('/reportes/dashboard')).data.data;
  }

  descargar(formato: FormatoReporte, params: Record<string, string>) {
    return this.http.get<Blob>(`/reportes/${formato}`, { params, responseType: 'blob', timeout: 120_000 });
  }

  async auditoria(params: Record<string, string | number>) {
    return (await this.http.get<ApiResponse<RegistroAuditoria[]>>('/reportes/auditoria', { params })).data;
  }
}
