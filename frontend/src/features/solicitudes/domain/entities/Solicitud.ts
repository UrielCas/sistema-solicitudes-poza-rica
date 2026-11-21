import { EstatusSolicitud, Prioridad } from '../../../../core/constants/estatus';
import { AreaRef } from '../../../auth/domain/entities/User';

export type { EstatusSolicitud, Prioridad };

export interface Domicilio {
  callePrincipal: string;
  numeroExterior: string;
  entreCalle?: string;
  yCalle?: string;
  colonia: string;
  codigoPostal: string;
  referencias: string;
}

export interface GeoSolicitud {
  latitud: number;
  longitud: number;
  zona?: string;
  validacionManual: boolean;
  fuente: 'MAPA' | 'GEOCODIFICACION';
}

export interface Solicitud {
  _id: string;
  folio: string;
  folioOficialia?: string;
  enlaceOficioDrive?: string;
  fechaRecepcion: string;
  solicitante: string;
  contacto: string;
  areaActual?: AreaRef | null;
  areasCorresponsables: AreaRef[];
  tipoSolicitud: string;
  tipoPeticion: string;
  prioridad: Prioridad;
  estatus: EstatusSolicitud;
  personaEncargada?: string;
  fechaAtencion?: string;
  descripcion: string;
  domicilio: Domicilio;
  enlaceEvidenciaDrive?: string;
  anio: number;
  zona?: string;
  creadoPor?: { _id: string; nombre: string; email?: string } | null;
  coordenadas?: { lat: number; lng: number };
  geo?: GeoSolicitud;
  createdAt?: string;
}

/** Datos que captura el formulario de nueva solicitud. */
export interface NuevaSolicitud {
  fechaRecepcion: string;
  folioOficialia: string;
  enlaceOficioDrive: string;
  solicitante: string;
  contacto: string;
  areaActual: string;
  areasCorresponsables: string[];
  tipoSolicitud: string;
  tipoPeticion: string;
  prioridad: Prioridad;
  estatus: EstatusSolicitud;
  personaEncargada: string;
  fechaAtencion: string;
  descripcion: string;
  domicilio: Required<Domicilio>;
  enlaceEvidenciaDrive: string;
  geo?: GeoSolicitud | null;
}

export interface FiltrosSolicitudes {
  anio?: string;
  areaActual?: string;
  estatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CoincidenciaOficio {
  _id: string;
  folio: string;
  folioOficialia?: string;
  solicitante?: string;
  estatus: EstatusSolicitud;
}

/** Coordenada de la solicitud (geo nuevo o coordenadas heredadas). */
export const coordenadaDe = (s: Solicitud): [number, number] | null => {
  if (s.geo?.latitud !== undefined && s.geo?.longitud !== undefined) return [s.geo.latitud, s.geo.longitud];
  if (s.coordenadas?.lat !== undefined && s.coordenadas?.lng !== undefined) return [s.coordenadas.lat, s.coordenadas.lng];
  return null;
};
