import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  nombre: string;
  email: string;
  password: string;
  rol: 'SUPERADMIN' | 'DIRECTOR_AREA' | 'OPERADOR' | 'VENTANILLA';
  area?: Types.ObjectId;
  activo: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    rol: {
      type: String,
      enum: ['SUPERADMIN', 'DIRECTOR_AREA', 'OPERADOR', 'VENTANILLA'],
      default: 'OPERADOR',
    },
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const UserModel = model<IUser>('User', userSchema);