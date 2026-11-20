import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { registerSchema, loginSchema } from './auth.validation';
import * as authService from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.registerUser(data);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.loginUser(email, password);
  res.json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshSession(refreshToken);
  res.json({ success: true, data: tokens });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user });
});