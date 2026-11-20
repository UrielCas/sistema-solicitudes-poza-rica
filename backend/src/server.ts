import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
  });
};

startServer();
