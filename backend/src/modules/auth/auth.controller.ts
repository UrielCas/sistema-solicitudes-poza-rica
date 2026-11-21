import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ok, created } from '../../core/utils/serializers';
import { registrarAuditoria } from '../../core/middleware/audit';
import { registerSchema, loginSchema, credencialesSchema } from './auth.validation';
import * as authService from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.registerUser(data);
  created(res, result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const cred = loginSchema.parse(req.body);
  const identificador = 'areaId' in cred ? { areaId: cred.areaId } : { email: cred.email };
  try {
    const result = await authService.loginUser(cred);
    registrarAuditoria({
      accion: 'LOGIN_OK',
      usuario: String(result.user.id),
      rol: result.user.rol,
      ip: req.ip,
      detalle: identificador,
    });
    ok(res, result);
  } catch (err) {
    registrarAuditoria({ accion: 'LOGIN_FALLIDO', ip: req.ip, detalle: identificador });
    throw err;
  }
});

export const areasLogin = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await authService.listAreasLogin());
});

export const updateCredenciales = asyncHandler(async (req: Request, res: Response) => {
  const data = credencialesSchema.parse(req.body);
  ok(res, await authService.updateCredenciales(req.user!.id, data));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  ok(res, await authService.refreshSession(refreshToken));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  ok(res, req.user);
});
