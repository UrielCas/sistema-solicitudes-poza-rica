/** Dirección que devuelve la geocodificación inversa (mapa → formulario). */
export interface DireccionDetectada {
  callePrincipal?: string;
  numeroExterior?: string;
  colonia?: string;
  codigoPostal?: string;
  descripcion?: string;
  zona?: string | null;
}

/** Coordenada candidata de una dirección escrita (formulario → mapa). */
export interface CandidatoUbicacion {
  latitud: number;
  longitud: number;
  descripcion: string;
  precision: 'DIRECCION' | 'COLONIA';
  zona?: string | null;
}

export interface DomicilioBusqueda {
  callePrincipal: string;
  numeroExterior: string;
  colonia: string;
  codigoPostal: string;
}
