import { axiosClient } from '../../core/network/axiosClient';
import { CatalogosRemoteDataSource } from './data/datasources/CatalogosRemoteDataSource';
import { CatalogosRepositoryImpl } from './data/repositories/CatalogosRepositoryImpl';
import { ObtenerCatalogosUseCase } from './domain/usecases/ObtenerCatalogosUseCase';
import { GestionarCatalogoUseCase } from './domain/usecases/GestionarCatalogoUseCase';
import { ObtenerAreasUseCase, CrearAreaUseCase } from './domain/usecases/AreasUseCases';

const repo = new CatalogosRepositoryImpl(new CatalogosRemoteDataSource(axiosClient));

export const obtenerCatalogosUseCase = new ObtenerCatalogosUseCase(repo);
export const gestionarCatalogoUseCase = new GestionarCatalogoUseCase(repo);
export const obtenerAreasUseCase = new ObtenerAreasUseCase(repo);
export const crearAreaUseCase = new CrearAreaUseCase(repo);
