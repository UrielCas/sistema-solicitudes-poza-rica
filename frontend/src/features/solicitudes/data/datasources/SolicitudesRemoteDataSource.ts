import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../../../shared/types/ApiResponse';
import { CoincidenciaOficio, Solicitud } from '../../domain/entities/Solicitud';

export class SolicitudesRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  async crear(body: Record<string, unknown>) {
    return (await this.http.post<ApiResponse<Solicitud>>('/solicitudes', body)).data.data;
  }

  /** Con page/limit la API responde una página y `meta`; sin ellos, la lista completa. */
  async listar(params: Record<string, string | number>) {
    return (await this.http.get<ApiResponse<Solicitud[]>>('/solicitudes', { params })).data;
  }

  async obtener(id: string) {
    return (await this.http.get<ApiResponse<Solicitud>>(`/solicitudes/${id}`)).data.data;
  }

  async cambiarEstatus(id: string, estatus: string) {
    return (await this.http.patch<ApiResponse<Solicitud>>(`/solicitudes/${id}/estatus`, { estatus })).data.data;
  }

  async buscarOficio(q: string) {
    return (await this.http.get<ApiResponse<CoincidenciaOficio[]>>('/solicitudes/check-oficio', { params: { q } })).data.data;
  }
}
