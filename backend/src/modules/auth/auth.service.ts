import jwt from 'jsonwebtoken';
import { UserModel } from './auth.model';
import { AreaModel } from '../areas/areas.model';
import { env } from '../../config/env';
import { DEPENDENCIAS } from '../../config/catalogoAreas';
import { AppError } from '../../core/errors/AppError';
import { serializeUser } from '../../core/utils/serializers';

const generateTokens = (user: any) => {
  const areaId = user.area?._id ? user.area._id.toString() : user.area?.toString();
  const payload = { id: user._id.toString(), rol: user.rol, areaId };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};


export const registerUser = async (data: any) => {
  const exists = await UserModel.findOne({ email: data.email });
  if (exists) throw new AppError('El correo ya está registrado', 409);

  const user = await UserModel.create(data);
  const tokens = generateTokens(user);
  return { user: serializeUser(user), ...tokens };
};

/** Áreas que tienen una cuenta activa — alimenta el selector público del login. */
export const listAreasLogin = async () => {
  const areaIds = await UserModel.distinct('area', {
    activo: true,
    rol: { $ne: 'SUPERADMIN' },
    area: { $exists: true },
  });
  const areas = await AreaModel.find({ _id: { $in: areaIds }, activa: true })
    .select('nombre siglas')
    .sort({ nombre: 1 });
  // Orden oficial del catálogo (Presidencia primero); áreas extra al final, alfabéticas.
  const orden = new Map(DEPENDENCIAS.map((d, i) => [d.nombre, i]));
  return areas.sort(
    (a, b) => (orden.get(a.nombre) ?? Infinity) - (orden.get(b.nombre) ?? Infinity)
  );
};

export const loginUser = async (cred: { areaId?: string; email?: string; password: string }) => {
  let user;
  if (cred.areaId) {
    if (!/^[a-f\d]{24}$/i.test(cred.areaId)) throw new AppError('Credenciales inválidas', 401);
    user = await UserModel.findOne({ area: cred.areaId, rol: { $ne: 'SUPERADMIN' }, activo: true })
      .select('+password')
      .populate('area', 'nombre siglas');
  } else {
    user = await UserModel.findOne({ email: cred.email!.toLowerCase(), activo: true })
      .select('+password')
      .populate('area', 'nombre siglas');
  }

  if (!user || !(await user.comparePassword(cred.password))) {
    throw new AppError('Credenciales inválidas', 401);
  }
  return { user: serializeUser(user), ...generateTokens(user) };
};

export const updateCredenciales = async (
  userId: string,
  data: { passwordActual: string; nuevoEmail?: string; nuevaPassword?: string }
) => {
  const user = await UserModel.findById(userId).select('+password').populate('area', 'nombre siglas');
  if (!user || !user.activo) throw new AppError('Usuario no válido', 401);
  if (!(await user.comparePassword(data.passwordActual))) {
    throw new AppError('La contraseña actual no es correcta', 400);
  }

  if (data.nuevoEmail && data.nuevoEmail.toLowerCase() !== user.email) {
    const ocupado = await UserModel.exists({ email: data.nuevoEmail.toLowerCase(), _id: { $ne: user._id } });
    if (ocupado) throw new AppError('Ese usuario/correo ya está en uso', 409);
    user.email = data.nuevoEmail;
  }
  if (data.nuevaPassword) {
    user.password = data.nuevaPassword;
    user.debeCambiarPassword = false;
  }
  await user.save();
  return serializeUser(user);
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
