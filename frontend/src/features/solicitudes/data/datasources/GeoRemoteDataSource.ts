import { AxiosInstance, isAxiosError } from 'axios';
import { ApiResponse } from '../../../../shared/types/ApiResponse';
import { esZonasGeoJSON, ZonasGeoJSON } from '../../../../core/utils/puntoEnPoligono';
import { CandidatoUbicacion, DireccionDetectada, DomicilioBusqueda } from '../../domain/entities/Ubicacion';

/** Copia estática del GeoJSON en el frontend (respaldo si el backend aún no lo tiene). */
const ZONAS_ESTATICAS = '/geo/zonas-poza-rica.geojson';

/**
 * Geocodificación a través del backend (/geo), que consulta Nominatim con caché y
 * respetando su límite de uso. El navegador ya no llama a Nominatim directamente.
 */
export class GeoRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  async reverse(lat: number, lng: number) {
    return (await this.http.get<ApiResponse<DireccionDetectada>>('/geo/reverse', { params: { lat, lng } })).data.data;
  }

  async buscar(d: DomicilioBusqueda) {
    const params: Record<string, string> = {};
    for (const [k, v] of Object.entries(d)) if (v.trim()) params[k] = v.trim();
    if (params.codigoPostal && !/^\d{5}$/.test(params.codigoPostal)) delete params.codigoPostal;
    return (await this.http.get<ApiResponse<CandidatoUbicacion | null>>('/geo/buscar', { params })).data.data;
  }

  async zonas(): Promise<ZonasGeoJSON | null> {
    try {
      const { data } = await this.http.get('/geo/zonas');
      if (esZonasGeoJSON(data)) return data;
    } catch (e) {
      if (!(isAxiosError(e) && e.response?.status === 404)) throw e;
    }
    try {
      const res = await fetch(ZONAS_ESTATICAS);
      if (!res.ok) return null;
      const json = await res.json();
      return esZonasGeoJSON(json) ? json : null;
    } catch {
      return null;
    }
  }
}
