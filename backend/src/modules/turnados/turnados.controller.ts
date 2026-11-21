import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import * as turnadosService from './turnados.service';

export const turnar = asyncHandler(async (req: Request, res: Response) => {
  const { solicitudId, areaDestino, instrucciones } = req.body;
  res.locals.recursoId = String(solicitudId); // la auditoría queda ligada a la solicitud
  const result = await turnadosService.turnarSolicitud(
    solicitudId,
    areaDestino,
    instrucciones,
    req.user!.id
  );
  res.status(201).json({ success: true, data: result });
});

export const historial = asyncHandler(async (req: Request, res: Response) => {
  const docs = await turnadosService.getHistorialTurnados(req.params.solicitudId);
  res.json({ success: true, data: docs });
});