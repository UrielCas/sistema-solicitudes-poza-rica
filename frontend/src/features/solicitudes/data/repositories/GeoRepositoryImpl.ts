import { conFallo } from '../../../../core/errors/AppFailure';
import { GeoRepository } from '../../domain/repositories/SolicitudesRepository';
import { DomicilioBusqueda } from '../../domain/entities/Ubicacion';
import { GeoRemoteDataSource } from '../datasources/GeoRemoteDataSource';

export class GeoRepositoryImpl implements GeoRepository {
  constructor(private readonly remoto: GeoRemoteDataSource) {}

  direccionDePunto(lat: number, lng: number) {
    return conFallo(() => this.remoto.reverse(lat, lng), 'No se pudo consultar la dirección de este punto');
  }

  puntoDeDireccion(d: DomicilioBusqueda) {
    return conFallo(() => this.remoto.buscar(d), 'No se pudo buscar la dirección en el mapa');
  }

  /** Sin zonas el formulario funciona igual: nunca falla, devuelve null. */
  zonas() {
    return this.remoto.zonas().catch(() => null);
  }
}
