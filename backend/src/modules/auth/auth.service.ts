import jwt from 'jsonwebtoken';
import { UserModel } from './auth.model';
import { env } from '../../config/env';
import { AppError } from '../../core/errors/AppError';

const generateTokens = (user: any) => {
  const payload = { id: user._id.toString(), rol: user.rol, areaId: user.area?.toString() };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const registerUser = async (data: any) => {
  const exists = await UserModel.findOne({ email: data.email });
  if (exists) throw new AppError('El correo ya está registrado', 409);

  const user = await UserModel.create(data);
  const tokens = generateTokens(user);
  return {
    user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol },
    ...tokens,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email, activo: true }).select('+password').populate('area');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Credenciales inválidas', 401);
  }
  const tokens = generateTokens(user);
  return {
    user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol, area: user.area },
    ...tokens,
  };
};

export const refreshSession = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.activo) throw new AppError('Usuario no válido', 401);
    return generateTokens(user);
  } catch {
    throw new AppError('Refresh token inválido o expirado', 401);
  }
};