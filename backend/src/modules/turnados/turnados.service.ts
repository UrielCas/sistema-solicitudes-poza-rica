import { TurnadoModel } from './turnados.model';
import { SolicitudModel } from '../solicitudes/solicitudes.model';
import { validarTransicion } from '../solicitudes/solicitudes.workflow';
import { AppError } from '../../core/errors/AppError';

export const turnarSolicitud = async (
  solicitudId: string,
  areaDestino: string,
  instrucciones: string,
  userId: string
) => {
  const solicitud = await SolicitudModel.findById(solicitudId);
  if (!solicitud) throw new AppError('Solicitud no encontrada', 404);

  validarTransicion(solicitud.estatus, 'TURNADA');

  const turnado = await TurnadoModel.create({
    solicitud: solicitud._id,
    areaOrigen: solicitud.areaActual,
    areaDestino,
    usuarioTurna: userId,
    instrucciones,
  });

  solicitud.areaActual = turnado.areaDestino;
  solicitud.estatus = 'TURNADA';
  await solicitud.save();

  return turnado.populate(['areaOrigen', 'areaDestino', 'usuarioTurna']);
};

export const getHistorialTurnados = async (solicitudId: string) => {
  return TurnadoModel.find({ solicitud: solicitudId })
    .populate('areaOrigen', 'nombre siglas')
    .populate('areaDestino', 'nombre siglas')
    .populate('usuarioTurna', 'nombre')
    .sort({ createdAt: -1 });
};