import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { AreaModel } from './areas.model';
import { AppError } from '../../core/errors/AppError';

export const getAreas = asyncHandler(async (_req: Request, res: Response) => {
  const areas = await AreaModel.find({ activa: true }).sort({ nombre: 1 });
  res.json({ success: true, data: areas });
});

export const createArea = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, siglas } = req.body;
  if (!nombre || !siglas) throw new AppError('Nombre y siglas son obligatorios', 400);
  const area = await AreaModel.create({ nombre, siglas });
  res.status(201).json({ success: true, data: area });
});