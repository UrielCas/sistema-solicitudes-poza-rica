import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../../../shared/types/ApiResponse';
import { Notificacion } from '../../domain/entities/Notificacion';

export class NotificacionesRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  async listar(page: number, limit: number) {
    return (await this.http.get<ApiResponse<Notificacion[]>>('/notificaciones', { params: { page, limit } })).data;
  }

  async noLeidas() {
    return (await this.http.get<ApiResponse<{ total: number }>>('/notificaciones/no-leidas')).data.data.total;
  }

  async marcarLeida(id: string) {
    await this.http.patch(`/notificaciones/${encodeURIComponent(id)}/leida`);
  }

  async marcarTodas() {
    return (await this.http.patch<ApiResponse<{ marcadas: number }>>('/notificaciones/leer-todas')).data.data.marcadas;
  }
}
