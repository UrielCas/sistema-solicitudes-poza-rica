export interface Evidencia {
  _id: string;
  tipo: 'ARCHIVO' | 'ENLACE';
  nombre: string;
  descripcion?: string;
  mimetype?: string;
  tamano?: number;
  enlace?: string;
  subidoPor?: { _id: string; nombre: string } | string;
  createdAt?: string;
}

export const nombreSubidoPor = (e: Evidencia) =>
  e.subidoPor && typeof e.subidoPor === 'object' ? e.subidoPor.nombre : undefined;
