import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../../../shared/types/ApiResponse';
import { Turnado } from '../../domain/entities/Turnado';

export class TurnadosRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  async turnar(body: { solicitudId: string; areaDestino: string; instrucciones: string }) {
    return (await this.http.post<ApiResponse<Turnado>>('/turnados', body)).data.data;
  }

  async historial(solicitudId: string) {
    return (await this.http.get<ApiResponse<Turnado[]>>(`/turnados/solicitud/${encodeURIComponent(solicitudId)}`)).data.data;
  }
}
