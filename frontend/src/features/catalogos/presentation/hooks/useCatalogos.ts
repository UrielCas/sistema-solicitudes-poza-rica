import { useQuery } from '@tanstack/react-query';
import { obtenerAreasUseCase, obtenerCatalogosUseCase } from '../../di';
import { CatalogosAgrupados } from '../../domain/entities/Catalogo';

export const CLAVE_CATALOGOS = ['catalogos', 'agrupados'] as const;
export const CLAVE_AREAS = ['areas'] as const;

const VACIO: CatalogosAgrupados = { TIPO_SOLICITUD: [], TIPO_PETICION: [], PRIORIDAD: [] };

/** Opciones de los catálogos homologados para formularios y filtros. */
export const useCatalogos = () => {
  const q = useQuery({ queryKey: CLAVE_CATALOGOS, queryFn: () => obtenerCatalogosUseCase.execute(), staleTime: 5 * 60_000 });
  return { ...q, catalogos: q.data ?? VACIO };
};

/** Dependencias municipales activas. */
export const useAreas = () => {
  const q = useQuery({ queryKey: CLAVE_AREAS, queryFn: () => obtenerAreasUseCase.execute(), staleTime: 5 * 60_000 });
  return { ...q, areas: q.data ?? [] };
};
