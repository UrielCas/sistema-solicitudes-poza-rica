import mongoose from 'mongoose';
import { env } from './env';
import { bootstrapCuentas } from './bootstrap';

// Uso manual: npx tsx src/config/seedAreas.ts
// (El servidor también ejecuta esta sincronización al arrancar.)
async function run() {
  await mongoose.connect(env.MONGO_URI);
  await bootstrapCuentas();
  process.exit(0);
}

run();
