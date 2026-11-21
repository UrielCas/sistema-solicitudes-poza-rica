import { AppFailure } from '../../../../core/errors/AppFailure';
import { detectarZona, ZonasGeoJSON } from '../../../../core/utils/puntoEnPoligono';
import { GeoRepository } from '../repositories/SolicitudesRepository';
import { GeoSolicitud } from '../entities/Solicitud';
import { DomicilioBusqueda } from '../entities/Ubicacion';

/** Georreferenciación bidireccional del domicilio (punto 3 del formulario). */
export class GeolocalizarUseCase {
  constructor(private readonly repo: GeoRepository) {}

  zonas() {
    return this.repo.zonas();
  }

  /** Objeto geo que se guarda con la solicitud; la zona se calcula con el GeoJSON si está cargado. */
  construirGeo(
    lat: number,
    lng: number,
    fuente: GeoSolicitud['fuente'],
    zonas: ZonasGeoJSON | null,
    zonaServidor?: string | null
  ): GeoSolicitud {
    return {
      latitud: Number(lat.toFixed(6)),
      longitud: Number(lng.toFixed(6)),
      zona: detectarZona(zonas, lat, lng) ?? zonaServidor ?? undefined,
      validacionManual: true,
      fuente,
    };
  }

  /** Mapa → formulario. */
  direccionDePunto(lat: number, lng: number) {
    return this.repo.direccionDePunto(lat, lng);
  }

  /** Formulario → mapa. */
  puntoDeDireccion(d: DomicilioBusqueda) {
    if (!d.callePrincipal.trim() && !d.colonia.trim()) {
      throw new AppFailure('Escribe al menos la calle principal o la colonia para ubicarla en el mapa.');
    }
    return this.repo.puntoDeDireccion(d);
  }
}
