import { Types } from 'mongoose';
import { NotificacionModel, TipoNotificacion } from './notificaciones.model';
import { JwtPayload } from '../../core/middleware/auth';
import { AppError } from '../../core/errors/AppError';
import { Paginacion, buildMeta } from '../../core/utils/pagination';

/**
 * Notificaciones dentro del sistema (canal "en la app").
 * Correo, WebSocket y push quedan como canales futuros: basta con agregarlos en `crear`.
 */

interface NuevaNotificacion {
  destinatario?: string | Types.ObjectId;
  area?: string | Types.ObjectId;
  rol?: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  solicitud?: string | Types.ObjectId;
}

/** Crea la notificación. Nunca hace fallar la operación que la originó. */
export const crear = async (n: NuevaNotificacion) => {
  try {
    return await NotificacionModel.create(n);
  } catch (err: any) {
    console.error('No se pudo crear la notificación:', err.message);
    return null;
  }
};

/** Filtro de "mis notificaciones": las personales, las de mi área y las de mi rol. */
const filtroUsuario = (user: JwtPayload) => {
  const or: Record<string, unknown>[] = [{ destinatario: user.id }, { rol: user.rol }];
  if (user.areaId) or.push({ area: user.areaId });
  return { $or: or };
};

export const listar = async (user: JwtPayload, p: Paginacion, soloNoLeidas = false) => {
  const filtro: Record<string, unknown> = filtroUsuario(user);
  if (soloNoLeidas) filtro.leidaPor = { $ne: user.id };
  const [docs, total] = await Promise.all([
    NotificacionModel.find(filtro)
      .populate('solicitud', 'folio estatus')
      .sort({ createdAt: -1 })
      .skip(p.skip)
      .limit(p.limit)
      .lean(),
    NotificacionModel.countDocuments(filtro),
  ]);
  const data = docs.map(({ leidaPor, ...n }) => ({
    ...n,
    leida: (leidaPor || []).some((id) => String(id) === user.id),
  }));
  return { data, meta: buildMeta(total, p) };
};

export const contarNoLeidas = (user: JwtPayload) =>
  NotificacionModel.countDocuments({ ...filtroUsuario(user), leidaPor: { $ne: user.id } });

export const marcarLeida = async (id: string, user: JwtPayload) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Notificación no encontrada', 404);
  const r = await NotificacionModel.updateOne(
    { _id: id, ...filtroUsuario(user) },
    { $addToSet: { leidaPor: user.id } }
  );
  if (r.matchedCount === 0) throw new AppError('Notificación no encontrada', 404);
};

export const marcarTodas = async (user: JwtPayload) => {
  const r = await NotificacionModel.updateMany(
    { ...filtroUsuario(user), leidaPor: { $ne: user.id } },
    { $addToSet: { leidaPor: user.id } }
  );
  return r.modifiedCount;
};

// ── Eventos del flujo de solicitudes ─────────────────────────────────────────

const ETIQUETA_ESTATUS: Record<string, string> = {
  PENDIENTE: 'PENDIENTE',
  RECIBIDA: 'RECIBIDA',
  TURNADA: 'TURNADA',
  EN_PROCESO: 'EN PROCESO',
  ATENDIDA: 'ATENDIDO',
  RECHAZADA: 'NO PROCEDE',
  CERRADA: 'CERRADA',
};

interface SolicitudResumen {
  _id: Types.ObjectId | string;
  folio: string;
  areaActual?: Types.ObjectId | string | null;
  tipoSolicitud?: string;
}

/** Un área capturó una solicitud → avisar a los Administradores. */
export const notificarNuevaSolicitud = (s: SolicitudResumen, nombreArea?: string) =>
  crear({
    rol: 'SUPERADMIN',
    tipo: 'NUEVA_SOLICITUD',
    titulo: `Nueva solicitud ${s.folio}`,
    mensaje: `${nombreArea || 'Un área'} registró una solicitud${s.tipoSolicitud ? ` de ${s.tipoSolicitud}` : ''}.`,
    solicitud: s._id,
  });

/** El Administrador cambió el estatus → avisar al área responsable. */
export const notificarCambioEstatus = (s: SolicitudResumen, anterior: string, nuevo: string) =>
  s.areaActual
    ? crear({
        area: s.areaActual,
        tipo: 'CAMBIO_ESTATUS',
        titulo: `Solicitud ${s.folio}: ${ETIQUETA_ESTATUS[nuevo] || nuevo}`,
        mensaje: `El estatus cambió de ${ETIQUETA_ESTATUS[anterior] || anterior} a ${ETIQUETA_ESTATUS[nuevo] || nuevo}.`,
        solicitud: s._id,
      })
    : Promise.resolve(null);

/** La solicitud se turnó a otra área → avisar al área destino. */
export const notificarTurnado = (s: SolicitudResumen, areaDestino: string | Types.ObjectId, instrucciones: string) =>
  crear({
    area: areaDestino,
    tipo: 'TURNADO',
    titulo: `Se te turnó la solicitud ${s.folio}`,
    mensaje: instrucciones,
    solicitud: s._id,
  });

/** Se agregó una evidencia → avisar a los Administradores (si la subió un área). */
export const notificarEvidencia = (s: SolicitudResumen, nombreEvidencia: string) =>
  crear({
    rol: 'SUPERADMIN',
    tipo: 'EVIDENCIA',
    titulo: `Nueva evidencia en ${s.folio}`,
    mensaje: nombreEvidencia,
    solicitud: s._id,
  });
