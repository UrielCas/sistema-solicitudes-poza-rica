export type TipoCatalogo = 'TIPO_SOLICITUD' | 'TIPO_PETICION' | 'PRIORIDAD';

export const NOMBRE_CATALOGO: Record<TipoCatalogo, string> = {
  TIPO_SOLICITUD: 'Tipos de solicitud',
  TIPO_PETICION: 'Tipos de petición',
  PRIORIDAD: 'Prioridades',
};

export interface ValorCatalogo {
  _id: string;
  tipo: TipoCatalogo;
  valor: string;
  etiqueta: string;
  orden: number;
  activo: boolean;
}

export interface OpcionCatalogo {
  valor: string;
  etiqueta: string;
}

export type CatalogosAgrupados = Record<TipoCatalogo, OpcionCatalogo[]>;

/** Dependencia municipal. */
export interface Area {
  _id: string;
  nombre: string;
  siglas: string;
  activa?: boolean;
}
