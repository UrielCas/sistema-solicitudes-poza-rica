import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from './AppError';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.errors[0]?.message || 'Datos de entrada inválidos',
      errors: err.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
    });
  }

  // Cuerpo JSON mal formado o demasiado grande (express.json / body-parser).
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'El cuerpo de la petición no es JSON válido' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'La petición es demasiado grande' });
  }

  // Validaciones del modelo (campos obligatorios, enums) e identificadores mal formados.
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ campo: e.path, mensaje: e.message }));
    return res.status(400).json({ success: false, message: 'Faltan datos o hay valores no válidos', errors });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, message: `Valor no válido para ${err.path}` });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ success: false, message: 'Ya existe un registro con esos datos' });
  }

  console.error('Error no controlado:', err);
  return res.status(500).json({ success: false, message: 'Error interno del servidor' });
};
