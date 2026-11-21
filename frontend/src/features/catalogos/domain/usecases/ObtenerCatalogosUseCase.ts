import { CatalogosRepository } from '../repositories/CatalogosRepository';

/** Opciones activas de todos los catálogos (para los formularios). */
export class ObtenerCatalogosUseCase {
  constructor(private readonly repo: CatalogosRepository) {}

  execute() {
    return this.repo.obtenerAgrupados();
  }
}
