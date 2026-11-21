import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../../../shared/types/ApiResponse';
import { Evidencia } from '../../domain/entities/Evidencia';

export class EvidenciasRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  private ruta(solicitudId: string) {
    return `/evidencias/solicitud/${encodeURIComponent(solicitudId)}`;
  }

  async listar(solicitudId: string) {
    return (await this.http.get<ApiResponse<Evidencia[]>>(this.ruta(solicitudId))).data.data;
  }

  async subir(solicitudId: string, archivo: File, descripcion?: string) {
    const form = new FormData();
    form.append('archivo', archivo);
    if (descripcion) form.append('descripcion', descripcion);
    // Sin Content-Type manual: el navegador agrega el boundary del multipart.
    const { data } = await this.http.post<ApiResponse<Evidencia>>(this.ruta(solicitudId), form, {
      headers: { 'Content-Type': undefined },
      timeout: 120_000,
    });
    return data.data;
  }

  async enlazar(solicitudId: string, enlace: string, nombre?: string) {
    return (await this.http.post<ApiResponse<Evidencia>>(this.ruta(solicitudId), { enlace, nombre })).data.data;
  }

  descargar(solicitudId: string, evidenciaId: string) {
    return this.http.get<Blob>(`${this.ruta(solicitudId)}/${encodeURIComponent(evidenciaId)}/descargar`, {
      responseType: 'blob',
      timeout: 120_000,
    });
  }

  async eliminar(solicitudId: string, evidenciaId: string) {
    await this.http.delete(`${this.ruta(solicitudId)}/${encodeURIComponent(evidenciaId)}`);
  }
}
