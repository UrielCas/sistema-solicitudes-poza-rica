import { Pagina } from '../../../../shared/types/ApiResponse';
import { ZonasGeoJSON } from '../../../../core/utils/puntoEnPoligono';
import { CoincidenciaOficio, EstatusSolicitud, FiltrosSolicitudes, NuevaSolicitud, Solicitud } from '../entities/Solicitud';
import { Evidencia } from '../entities/Evidencia';
import { CandidatoUbicacion, DireccionDetectada, DomicilioBusqueda } from '../entities/Ubicacion';

export interface SolicitudesRepository {
  crear(datos: NuevaSolicitud): Promise<Solicitud>;
  listar(filtros: FiltrosSolicitudes): Promise<Pagina<Solicitud>>;
  listarTodas(filtros?: FiltrosSolicitudes): Promise<Solicitud[]>;
  obtener(id: string): Promise<Solicitud>;
  cambiarEstatus(id: string, estatus: EstatusSolicitud): Promise<Solicitud>;
  buscarOficio(q: string): Promise<CoincidenciaOficio[]>;
}

export interface EvidenciasRepository {
  listar(solicitudId: string): Promise<Evidencia[]>;
  subirArchivo(solicitudId: string, archivo: File, descripcion?: string): Promise<Evidencia>;
  agregarEnlace(solicitudId: string, enlace: string, nombre?: string): Promise<Evidencia>;
  descargar(solicitudId: string, evidencia: Evidencia): Promise<void>;
  eliminar(solicitudId: string, evidenciaId: string): Promise<void>;
}

export interface GeoRepository {
  direccionDePunto(lat: number, lng: number): Promise<DireccionDetectada>;
  puntoDeDireccion(d: DomicilioBusqueda): Promise<CandidatoUbicacion | null>;
  zonas(): Promise<ZonasGeoJSON | null>;
}
