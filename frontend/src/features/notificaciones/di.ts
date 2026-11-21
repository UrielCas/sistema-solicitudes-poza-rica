import { axiosClient } from '../../core/network/axiosClient';
import { NotificacionesRemoteDataSource } from './data/datasources/NotificacionesRemoteDataSource';
import { NotificacionesRepositoryImpl } from './data/repositories/NotificacionesRepositoryImpl';
import { NotificacionesUseCase } from './domain/usecases/NotificacionesUseCases';

export const notificacionesUseCase = new NotificacionesUseCase(
  new NotificacionesRepositoryImpl(new NotificacionesRemoteDataSource(axiosClient))
);
