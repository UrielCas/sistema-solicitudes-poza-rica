import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ADMIN_EMAIL: z.string().email().default('admin@pozarica.gob.mx'),
  ADMIN_PASSWORD: z.string().min(8).default('Password123'),
  INITIAL_AREA_PASSWORD: z.string().min(8).default('PozaRica2026'),
  // Geolocalización
  NOMINATIM_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  ZONAS_GEOJSON_PATH: z.string().default('data/zonas-poza-rica.geojson'),
  // Evidencias (archivos subidos)
  UPLOADS_DIR: z.string().default('uploads'),
  EVIDENCIA_MAX_MB: z.coerce.number().positive().max(50).default(10),
});

export const env = envSchema.parse(process.env);
