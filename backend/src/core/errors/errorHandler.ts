import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './AppError';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: err.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
    });
  }

  console.error('Error no controlado:', err);
  return res.status(500).json({ success: false, message: 'Error interno del servidor' });
};