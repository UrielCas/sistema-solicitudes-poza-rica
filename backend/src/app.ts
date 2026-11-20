import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './core/errors/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import areasRoutes from './modules/areas/areas.routes';
import solicitudesRoutes from './modules/solicitudes/solicitudes.routes';
import turnadosRoutes from './modules/turnados/turnados.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'API Sistema de Solicitudes Poza Rica activa' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/areas', areasRoutes);
app.use('/api/v1/solicitudes', solicitudesRoutes);
app.use('/api/v1/turnados', turnadosRoutes);

app.use(errorHandler);

export default app;