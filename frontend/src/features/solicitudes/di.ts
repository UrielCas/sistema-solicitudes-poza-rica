import { axiosClient } from '../../core/network/axiosClient';
import { SolicitudesRemoteDataSource } from './data/datasources/SolicitudesRemoteDataSource';
import { EvidenciasRemoteDataSource } from './data/datasources/EvidenciasRemoteDataSource';
import { GeoRemoteDataSource } from './data/datasources/GeoRemoteDataSource';
import { SolicitudesRepositoryImpl } from './data/repositories/SolicitudesRepositoryImpl';
import { EvidenciasRepositoryImpl } from './data/repositories/EvidenciasRepositoryImpl';
import { GeoRepositoryImpl } from './data/repositories/GeoRepositoryImpl';
import { CrearSolicitudUseCase } from './domain/usecases/CrearSolicitudUseCase';
import { ConsultarSolicitudesUseCase } from './domain/usecases/ConsultarSolicitudesUseCase';
import { CambiarEstatusUseCase } from './domain/usecases/CambiarEstatusUseCase';
import { GestionarEvidenciasUseCase } from './domain/usecases/GestionarEvidenciasUseCase';
import { GeolocalizarUseCase } from './domain/usecases/GeolocalizarUseCase';

const solicitudesRepo = new SolicitudesRepositoryImpl(new SolicitudesRemoteDataSource(axiosClient));
const evidenciasRepo = new EvidenciasRepositoryImpl(new EvidenciasRemoteDataSource(axiosClient));
const geoRepo = new GeoRepositoryImpl(new GeoRemoteDataSource(axiosClient));

export const crearSolicitudUseCase = new CrearSolicitudUseCase(solicitudesRepo, evidenciasRepo);
export const consultarSolicitudesUseCase = new ConsultarSolicitudesUseCase(solicitudesRepo);
export const cambiarEstatusUseCase = new CambiarEstatusUseCase(solicitudesRepo);
export const gestionarEvidenciasUseCase = new GestionarEvidenciasUseCase(evidenciasRepo);
export const geolocalizarUseCase = new GeolocalizarUseCase(geoRepo);
