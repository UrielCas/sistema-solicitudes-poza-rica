import { SolicitudModel, EstatusSolicitud } from './solicitudes.model';
import { validarTransicion } from './solicitudes.workflow';
import { AppError } from '../../core/errors/AppError';

export const createSolicitud = async (data: any, userId: string) => {
  const fecha = data.fechaRecepcion ? new Date(data.fechaRecepcion) : new Date();
  const anio = data.anio || fecha.getFullYear();
  const count = await SolicitudModel.countDocuments({ anio });
  const folio = `PR-${anio}-${String(count + 1).padStart(4, '0')}`;

  return SolicitudModel.create({
    ...data,
    anio,
    folio,
    creadoPor: userId,
  });
};

export const checkCoincidenciasOficio = async (q: string) => {
  if (!q || q.trim().length < 2) return [];
  const regex = new RegExp(q.trim(), 'i');
  return SolicitudModel.find({
    $or: [{ folioOficialia: regex }, { folio: regex }],
  })
    .select('folio folioOficialia solicitante estatus fechaRecepcion areaActual')
    .populate('areaActual', 'nombre')
    .limit(10);
};

export const listSolicitudes = async (query: any) => {
  const filter: any = {};
  if (query.anio) filter.anio = Number(query.anio);
  if (query.zona) filter.zona = new RegExp(query.zona, 'i');
  if (query.estatus) filter.estatus = query.estatus;
  if (query.areaActual) filter.areaActual = query.areaActual;
  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [
      { folio: regex },
      { folioOficialia: regex },
      { solicitante: regex },
      { 'domicilio.colonia': regex },
    ];
  }

  return SolicitudModel.find(filter)
    .populate('areaActual', 'nombre siglas')
    .populate('areasCorresponsables', 'nombre siglas')
    .populate('creadoPor', 'nombre')
    .sort({ createdAt: -1 });
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

  validarTransicion(solicitud.estatus, nuevoEstatus);
  solicitud.estatus = nuevoEstatus;
  await solicitud.save();
  return solicitud;
};