import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (retries = 5, delay = 3000): Promise<void> => {
  while (retries > 0) {
    try {
      await mongoose.connect(env.MONGO_URI);
      console.log('MongoDB conectado correctamente');
      return;
    } catch (error) {
      retries -= 1;
      console.error(`Error conectando a MongoDB. Reintentos: ${retries}`, error);
      if (retries === 0) process.exit(1);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};
