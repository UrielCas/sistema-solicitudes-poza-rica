import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { cambiarEstatusUseCase, consultarSolicitudesUseCase, gestionarEvidenciasUseCase } from '../../di';
import { EstatusSolicitud, FiltrosSolicitudes, Solicitud } from '../../domain/entities/Solicitud';

export const claves = {
  todas: ['solicitudes'] as const,
  pagina: (f: FiltrosSolicitudes) => ['solicitudes', 'pagina', f] as const,
  mapa: ['solicitudes', 'mapa'] as const,
  detalle: (id: string) => ['solicitud', id] as const,
  evidencias: (id: string) => ['evidencias', id] as const,
};

/** Invalida todo lo que depende de las solicitudes (listas, mapa, dashboard, notificaciones). */
export const useRefrescarSolicitudes = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: claves.todas });
    qc.invalidateQueries({ queryKey: ['solicitud'] });
    qc.invalidateQueries({ queryKey: ['reportes', 'dashboard'] });
    qc.invalidateQueries({ queryKey: ['notificaciones'] });
  };
};

export const useSolicitudesPaginadas = (filtros: FiltrosSolicitudes) =>
  useQuery({
    queryKey: claves.pagina(filtros),
    queryFn: () => consultarSolicitudesUseCase.pagina(filtros),
    placeholderData: keepPreviousData,
  });

export const useSolicitudesMapa = () =>
  useQuery({ queryKey: claves.mapa, queryFn: () => consultarSolicitudesUseCase.todas() });

export const useSolicitud = (id: string) =>
  useQuery({ queryKey: claves.detalle(id), queryFn: () => consultarSolicitudesUseCase.expediente(id), enabled: !!id });

export const useCambiarEstatus = (solicitud?: Solicitud) => {
  const refrescar = useRefrescarSolicitudes();
  return useMutation({
    mutationFn: (estatus: EstatusSolicitud) => cambiarEstatusUseCase.execute(solicitud!, estatus),
    onSuccess: refrescar,
  });
};

export const useEvidencias = (solicitudId: string) =>
  useQuery({ queryKey: claves.evidencias(solicitudId), queryFn: () => gestionarEvidenciasUseCase.listar(solicitudId) });
