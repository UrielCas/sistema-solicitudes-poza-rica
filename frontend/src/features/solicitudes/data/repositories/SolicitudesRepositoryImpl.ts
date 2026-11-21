import { conFallo } from '../../../../core/errors/AppFailure';
import { SolicitudesRepository } from '../../domain/repositories/SolicitudesRepository';
import { EstatusSolicitud, FiltrosSolicitudes, NuevaSolicitud } from '../../domain/entities/Solicitud';
import { SolicitudesRemoteDataSource } from '../datasources/SolicitudesRemoteDataSource';

/** Quita los filtros vacíos para no mandar ?estatus=&anio= a la API. */
const aParametros = (f: FiltrosSolicitudes = {}) => {
  const p: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(f)) if (v !== undefined && v !== '') p[k] = v as string | number;
  return p;
};

/** Formulario → cuerpo de la API (campos vacíos como undefined). */
const aPayload = (d: NuevaSolicitud) => ({
  ...d,
  fechaAtencion: d.fechaAtencion || undefined,
  areaActual: d.areaActual || undefined,
  geo: d.geo || undefined,
});

export class SolicitudesRepositoryImpl implements SolicitudesRepository {
  constructor(private readonly remoto: SolicitudesRemoteDataSource) {}

  crear(datos: NuevaSolicitud) {
    return conFallo(() => this.remoto.crear(aPayload(datos)), 'Error al guardar la solicitud');
  }

  listar(filtros: FiltrosSolicitudes) {
    return conFallo(async () => {
      const r = await this.remoto.listar(aParametros(filtros));
      const meta = r.meta ?? { total: r.data.length, page: 1, limit: r.data.length || 1, totalPages: 1 };
      return { items: r.data, meta };
    }, 'No se pudieron cargar las solicitudes');
  }

  listarTodas(filtros?: FiltrosSolicitudes) {
    const { page: _p, limit: _l, ...resto } = filtros ?? {};
    return conFallo(async () => (await this.remoto.listar(aParametros(resto))).data, 'No se pudieron cargar las solicitudes');
  }

  obtener(id: string) {
    return conFallo(() => this.remoto.obtener(id), 'No se pudo cargar la solicitud');
  }

  cambiarEstatus(id: string, estatus: EstatusSolicitud) {
    return conFallo(() => this.remoto.cambiarEstatus(id, estatus), 'No se pudo actualizar el estatus');
  }

  buscarOficio(q: string) {
    return conFallo(() => this.remoto.buscarOficio(q), 'No se pudo revisar el oficio');
  }
}
