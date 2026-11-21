import { axiosClient } from '../../core/network/axiosClient';
import { ReportesRemoteDataSource } from './data/datasources/ReportesRemoteDataSource';
import { ReportesRepositoryImpl } from './data/repositories/ReportesRepositoryImpl';
import { ConsultarAuditoriaUseCase, ExportarReporteUseCase, ObtenerDashboardUseCase } from './domain/usecases/ReportesUseCases';

const repo = new ReportesRepositoryImpl(new ReportesRemoteDataSource(axiosClient));

export const obtenerDashboardUseCase = new ObtenerDashboardUseCase(repo);
export const exportarReporteUseCase = new ExportarReporteUseCase(repo);
export const consultarAuditoriaUseCase = new ConsultarAuditoriaUseCase(repo);
