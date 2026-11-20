import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import * as solicitudesService from './solicitudes.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const doc = await solicitudesService.createSolicitud(req.body, req.user!.id);
  res.status(201).json({ success: true, data: doc });
});

export const checkOficio = asyncHandler(async (req: Request, res: Response) => {
  const docs = await solicitudesService.checkCoincidenciasOficio(String(req.query.q || ''));
  res.json({ success: true, data: docs });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const docs = await solicitudesService.listSolicitudes(req.query);
  res.json({ success: true, data: docs });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const doc = await solicitudesService.getSolicitudById(req.params.id);
  res.json({ success: true, data: doc });
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const doc = await solicitudesService.updateEstatus(req.params.id, req.body.estatus);
  res.json({ success: true, data: doc });
});