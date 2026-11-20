import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { JwtPayload } from './auth';

export const authorizeRoles = (...allowedRoles: JwtPayload['rol'][]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
      return next(new AppError('No tienes permisos para realizar esta acción', 403));
    }
    next();
  };
};