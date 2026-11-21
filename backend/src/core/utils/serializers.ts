import { Response } from 'express';
import type { PaginacionMeta } from './pagination';

/**
 * Formato único de respuesta de la API:
 *   { success: true, data, meta? }   → éxito
 *   { success: false, message, errors? } → error (lo arma errorHandler)
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: PaginacionMeta;
  message?: string;
}

export const ok = <T>(res: Response, data: T, meta?: PaginacionMeta) => {
  const body: ApiResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  return res.json(body);
};

export const created = <T>(res: Response, data: T) => res.status(201).json({ success: true, data } as ApiResponse<T>);

export const mensaje = (res: Response, message: string, status = 200) =>
  res.status(status).json({ success: true, message } as ApiResponse<never>);

/** Usuario sin datos sensibles (nunca expone password). */
export const serializeUser = (user: any) => ({
  id: user._id,
  nombre: user.nombre,
  email: user.email,
  rol: user.rol,
  area: user.area,
  debeCambiarPassword: !!user.debeCambiarPassword,
});
