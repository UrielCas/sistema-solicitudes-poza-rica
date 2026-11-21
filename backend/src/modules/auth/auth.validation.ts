import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['SUPERADMIN', 'DIRECTOR_AREA', 'OPERADOR', 'VENTANILLA']).optional(),
  area: z.string().optional(),
});

/** Login de un área municipal (elige su Dirección/Área) o del Administrador (correo). */
export const loginSchema = z.union([
  z.object({ areaId: z.string().min(1), password: z.string().min(1) }),
  z.object({ email: z.string().email(), password: z.string().min(1) }),
]);

export const credencialesSchema = z
  .object({
    passwordActual: z.string().min(1, 'Ingresa tu contraseña actual'),
    nuevoEmail: z.string().email('Correo no válido').optional(),
    nuevaPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').optional(),
  })
  .refine((d) => d.nuevoEmail || d.nuevaPassword, {
    message: 'Indica un nuevo usuario, una nueva contraseña o ambos',
  });
