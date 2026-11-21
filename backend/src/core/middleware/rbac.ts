import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AppError } from '../errors/AppError';
import { JwtPayload } from './auth';

/** Permite el paso solo a los roles indicados. */
export const authorizeRoles = (...allowedRoles: JwtPayload['rol'][]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
      return next(new AppError('No tienes permisos para realizar esta acción', 403));
    }
    next();
  };
};

export const esAdmin = (user?: JwtPayload) => user?.rol === 'SUPERADMIN';

/**
 * Control por área: el Administrador ve todo; cualquier otra cuenta solo
 * puede operar sobre recursos de su propia área.
 */
export const puedeAccederArea = (user: JwtPayload | undefined, areaId?: string | Types.ObjectId | null) => {
  if (!user) return false;
  if (esAdmin(user)) return true;
  return !!areaId && !!user.areaId && String(areaId) === String(user.areaId);
};

export const assertAccesoArea = (user: JwtPayload | undefined, areaId?: string | Types.ObjectId | null) => {
  if (!puedeAccederArea(user, areaId)) {
    throw new AppError('No tienes permisos sobre los registros de otra área', 403);
  }
};
