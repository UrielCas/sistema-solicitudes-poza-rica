import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './core/errors/errorHandler';
import { AppError } from './core/errors/AppError';
import authRoutes from './modules/auth/auth.routes';
import areasRoutes from './modules/areas/areas.routes';
import solicitudesRoutes from './modules/solicitudes/solicitudes.routes';
import turnadosRoutes from './modules/turnados/turnados.routes';
import reportesRoutes from './modules/reportes/reportes.routes';
import catalogosRoutes from './modules/catalogos/catalogos.routes';
import geoRoutes from './modules/geolocalizacion/geo.routes';
import evidenciasRoutes from './modules/evidencias/evidencias.routes';
import notificacionesRoutes from './modules/notificaciones/notificaciones.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true, exposedHeaders: ['Content-Disposition'] }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'API Sistema de Solicitudes Poza Rica activa' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/areas', areasRoutes);
app.use('/api/v1/solicitudes', solicitudesRoutes);
app.use('/api/v1/turnados', turnadosRoutes);
app.use('/api/v1/reportes', reportesRoutes);
app.use('/api/v1/catalogos', catalogosRoutes);
app.use('/api/v1/geo', geoRoutes);
app.use('/api/v1/evidencias', evidenciasRoutes);
app.use('/api/v1/notificaciones', notificacionesRoutes);

// Ruta inexistente → JSON en el formato de la API (no la página HTML de Express).
app.use('/api', (_req, _res, next) => next(new AppError('Ruta no encontrada', 404)));

app.use(errorHandler);

export default app;
