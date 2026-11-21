import { axiosClient } from '../../core/network/axiosClient';
import { TurnadosRemoteDataSource } from './data/datasources/TurnadosRemoteDataSource';
import { TurnadosRepositoryImpl } from './data/repositories/TurnadosRepositoryImpl';
import { TurnarSolicitudUseCase } from './domain/usecases/TurnarSolicitudUseCase';
import { ObtenerHistorialUseCase } from './domain/usecases/ObtenerHistorialUseCase';

const repo = new TurnadosRepositoryImpl(new TurnadosRemoteDataSource(axiosClient));

export const turnarSolicitudUseCase = new TurnarSolicitudUseCase(repo);
export const obtenerHistorialUseCase = new ObtenerHistorialUseCase(repo);
