import { authRepository } from '../auth/di';
import { sesionStore } from '../auth/presentation/store/useAuthStore';
import { ActualizarCredencialesUseCase } from './domain/usecases/ActualizarCredencialesUseCase';

export const actualizarCredencialesUseCase = new ActualizarCredencialesUseCase(authRepository, sesionStore);
