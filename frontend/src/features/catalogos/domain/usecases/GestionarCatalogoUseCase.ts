import { AppFailure } from '../../../../core/errors/AppFailure';
import { CatalogosRepository } from '../repositories/CatalogosRepository';
import { TipoCatalogo, ValorCatalogo } from '../entities/Catalogo';

/** Administración de un catálogo (solo Administrador): listar, agregar, renombrar, activar/desactivar. */
export class GestionarCatalogoUseCase {
  constructor(private readonly repo: CatalogosRepository) {}

  listar(tipo: TipoCatalogo) {
    return this.repo.listarValores(tipo, true);
  }

  agregar(tipo: TipoCatalogo, valor: string) {
    const limpio = valor.trim();
    if (!limpio) throw new AppFailure('Escribe el nombre del nuevo valor.');
    if (tipo === 'PRIORIDAD') throw new AppFailure('Las prioridades no se pueden agregar, solo renombrar.');
    return this.repo.crearValor({ tipo, valor: limpio, etiqueta: limpio });
  }

  renombrar(item: ValorCatalogo, etiqueta: string) {
    const limpio = etiqueta.trim();
    if (!limpio) throw new AppFailure('La etiqueta no puede quedar vacía.');
    return this.repo.actualizarValor(item._id, { etiqueta: limpio });
  }

  alternarActivo(item: ValorCatalogo) {
    if (item.tipo === 'PRIORIDAD') throw new AppFailure('Las prioridades no se pueden desactivar.');
    return this.repo.actualizarValor(item._id, { activo: !item.activo });
  }
}
