import { SolicitudModel, EstatusSolicitud } from './solicitudes.model';
import { validarTransicion } from './solicitudes.workflow';
import { AppError } from '../../core/errors/AppError';
import { JwtPayload } from '../../core/middleware/auth';
import { Paginacion, buildMeta } from '../../core/utils/pagination';
import { AreaModel } from '../areas/areas.model';
import { valorPermitido } from '../catalogos/catalogos.model';
import { dentroDelMunicipio, detectarZona } from '../geolocalizacion/geo.service';
import { notificarNuevaSolicitud, notificarCambioEstatus } from '../notificaciones/notificaciones.service';

const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Normaliza el objeto geo que manda el mapa.
 * - Descarta coordenadas inválidas.
 * - Rechaza puntos fuera de Poza Rica.
 * - Si el servidor tiene el GeoJSON de zonas, la zona la calcula el servidor (no se confía en el navegador).
 */
const normalizarGeo = (geo: any) => {
  const lat = Number(geo?.latitud);
  const lng = Number(geo?.longitud);
  if (geo == null || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return undefined;
  }
  if (!dentroDelMunicipio(lat, lng)) {
    throw new AppError('La ubicación marcada en el mapa está fuera de Poza Rica. Corrige el pin.', 400);
  }
  const zonaCliente = typeof geo.zona === 'string' && geo.zona.trim() ? geo.zona.trim() : undefined;
  return {
    latitud: lat,
    longitud: lng,
    zona: detectarZona(lat, lng) ?? zonaCliente,
    validacionManual: geo.validacionManual !== false,
    fuente: geo.fuente === 'GEOCODIFICACION' ? 'GEOCODIFICACION' : 'MAPA',
  };
};

export const createSolicitud = async (input: any, user: JwtPayload) => {
  const {
    folio: _f,
    creadoPor: _c,
    anio: _a,
    coordenadas: _co,
    evidencias: _ev,
    geo: geoInput,
    ...data
  } = input || {};

  // Las áreas municipales solo capturan: la solicitud queda ligada a su área y entra como PENDIENTE.
  if (user.rol !== 'SUPERADMIN') {
    if (!user.areaId) throw new AppError('Tu cuenta no tiene un área asignada', 403);
    data.areaActual = user.areaId;
    data.estatus = 'PENDIENTE';
  }

  // Catálogos homologados (módulo catalogos).
  if (data.tipoSolicitud && !(await valorPermitido('TIPO_SOLICITUD', String(data.tipoSolicitud)))) {
    throw new AppError('El tipo de solicitud no está en el catálogo', 400);
  }
  if (data.tipoPeticion && !(await valorPermitido('TIPO_PETICION', String(data.tipoPeticion)))) {
    throw new AppError('El tipo de petición no está en el catálogo', 400);
  }

  const geo = normalizarGeo(geoInput);
  if (geo) {
    data.geo = geo;
    data.coordenadas = { lat: geo.latitud, lng: geo.longitud };
    if (geo.zona) data.zona = geo.zona;
  }

  const fecha = data.fechaRecepcion ? new Date(data.fechaRecepcion) : new Date();
  const anio = fecha.getFullYear();
  const count = await SolicitudModel.countDocuments({ anio });
  const folio = `PR-${anio}-${String(count + 1).padStart(4, '0')}`;

  const solicitud = await SolicitudModel.create({
    ...data,
    anio,
    folio,
    creadoPor: user.id,
  });

  if (user.rol !== 'SUPERADMIN') {
    const area = await AreaModel.findById(solicitud.areaActual).select('nombre').lean();
    notificarNuevaSolicitud(solicitud, area?.nombre);
  }
  return solicitud;
};

export const checkCoincidenciasOficio = async (q: string) => {
  if (!q || q.trim().length < 2) return [];
  const regex = new RegExp(escapeRegex(q.trim()), 'i');
  return SolicitudModel.find({
    $or: [{ folioOficialia: regex }, { folio: regex }],
  })
    .select('folio folioOficialia solicitante estatus fechaRecepcion areaActual')
    .populate('areaActual', 'nombre')
    .limit(10);
};

/** Filtros comunes del listado y los reportes (?anio, ?zona, ?estatus, ?areaActual, ?search). */
export const construirFiltro = (query: any) => {
  const filter: any = {};
  if (query.anio) filter.anio = Number(query.anio);
  if (query.zona) filter.zona = new RegExp(escapeRegex(String(query.zona)), 'i');
  if (query.estatus) filter.estatus = String(query.estatus);
  if (query.areaActual) filter.areaActual = String(query.areaActual);
  if (query.search) {
    const regex = new RegExp(escapeRegex(String(query.search)), 'i');
    filter.$or = [
      { folio: regex },
      { folioOficialia: regex },
      { solicitante: regex },
      { 'domicilio.colonia': regex },
    ];
  }
  return filter;
};

/** Lista completa (sin paginación) o una página con `meta` si se pasa `paginacion`. */
export const listSolicitudes = async (query: any, paginacion?: Paginacion) => {
  const filter = construirFiltro(query);
  const consulta = SolicitudModel.find(filter)
    .select('-evidencias')
    .populate('areaActual', 'nombre siglas')
    .populate('areasCorresponsables', 'nombre siglas')
    .populate('creadoPor', 'nombre')
    .sort({ createdAt: -1 });

  if (!paginacion) return { data: await consulta };
  const [data, total] = await Promise.all([
    consulta.skip(paginacion.skip).limit(paginacion.limit),
    SolicitudModel.countDocuments(filter),
  ]);
  return { data, meta: buildMeta(total, paginacion) };
};

export const getSolicitudById = async (id: string) => {
  const doc = await SolicitudModel.findById(id)
    .populate('areaActual', 'nombre siglas')
    .populate('areasCorresponsables', 'nombre siglas')
    .populate('creadoPor', 'nombre email');
  if (!doc) throw new AppError('Solicitud no encontrada', 404);
  return doc;
};

export const updateEstatus = async (id: string, nuevoEstatus: EstatusSolicitud) => {
  const solicitud = await SolicitudModel.findById(id);
  if (!solicitud) throw new AppError('Solicitud no encontrada', 404);

  const anterior = solicitud.estatus;
  validarTransicion(anterior, nuevoEstatus);
  solicitud.estatus = nuevoEstatus;
  await solicitud.save();
  notificarCambioEstatus(solicitud, anterior, nuevoEstatus);
  return solicitud;
};
