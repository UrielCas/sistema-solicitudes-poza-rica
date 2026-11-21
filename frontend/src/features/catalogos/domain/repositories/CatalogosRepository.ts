import { Area, CatalogosAgrupados, TipoCatalogo, ValorCatalogo } from '../entities/Catalogo';

export interface CatalogosRepository {
  obtenerAgrupados(): Promise<CatalogosAgrupados>;
  listarValores(tipo: TipoCatalogo, incluirInactivos: boolean): Promise<ValorCatalogo[]>;
  crearValor(datos: { tipo: TipoCatalogo; valor: string; etiqueta?: string }): Promise<ValorCatalogo>;
  actualizarValor(id: string, cambios: Partial<Pick<ValorCatalogo, 'etiqueta' | 'orden' | 'activo'>>): Promise<ValorCatalogo>;
  obtenerAreas(): Promise<Area[]>;
  crearArea(datos: { nombre: string; siglas: string }): Promise<Area>;
}
