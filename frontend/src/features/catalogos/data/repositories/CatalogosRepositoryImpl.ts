import { conFallo } from '../../../../core/errors/AppFailure';
import { CatalogosRepository } from '../../domain/repositories/CatalogosRepository';
import { TipoCatalogo, ValorCatalogo } from '../../domain/entities/Catalogo';
import { CatalogosRemoteDataSource } from '../datasources/CatalogosRemoteDataSource';

export class CatalogosRepositoryImpl implements CatalogosRepository {
  constructor(private readonly remoto: CatalogosRemoteDataSource) {}

  obtenerAgrupados() {
    return conFallo(() => this.remoto.agrupados(), 'No se pudieron cargar los catálogos');
  }

  listarValores(tipo: TipoCatalogo, incluirInactivos: boolean) {
    return conFallo(() => this.remoto.listar(tipo, incluirInactivos), 'No se pudo cargar el catálogo');
  }

  crearValor(datos: { tipo: TipoCatalogo; valor: string; etiqueta?: string }) {
    return conFallo(() => this.remoto.crear(datos), 'No se pudo agregar el valor');
  }

  actualizarValor(id: string, cambios: Partial<Pick<ValorCatalogo, 'etiqueta' | 'orden' | 'activo'>>) {
    return conFallo(() => this.remoto.actualizar(id, cambios), 'No se pudo actualizar el valor');
  }

  obtenerAreas() {
    return conFallo(() => this.remoto.areas(), 'No se pudo cargar el catálogo de dependencias');
  }

  crearArea(datos: { nombre: string; siglas: string }) {
    return conFallo(() => this.remoto.crearArea(datos), 'No se pudo agregar la dependencia');
  }
}
