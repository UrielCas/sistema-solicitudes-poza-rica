import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../../../shared/types/ApiResponse';
import { Area, CatalogosAgrupados, TipoCatalogo, ValorCatalogo } from '../../domain/entities/Catalogo';

export class CatalogosRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  async agrupados() {
    return (await this.http.get<ApiResponse<CatalogosAgrupados>>('/catalogos/agrupados')).data.data;
  }

  async listar(tipo: TipoCatalogo, todos: boolean) {
    const params = { tipo, ...(todos ? { todos: '1' } : {}) };
    return (await this.http.get<ApiResponse<ValorCatalogo[]>>('/catalogos', { params })).data.data;
  }

  async crear(body: { tipo: TipoCatalogo; valor: string; etiqueta?: string }) {
    return (await this.http.post<ApiResponse<ValorCatalogo>>('/catalogos', body)).data.data;
  }

  async actualizar(id: string, body: Record<string, unknown>) {
    return (await this.http.patch<ApiResponse<ValorCatalogo>>(`/catalogos/${id}`, body)).data.data;
  }

  async areas() {
    return (await this.http.get<ApiResponse<Area[]>>('/areas')).data.data;
  }

  async crearArea(body: { nombre: string; siglas: string }) {
    return (await this.http.post<ApiResponse<Area>>('/areas', body)).data.data;
  }
}
