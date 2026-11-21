/** Formato de respuesta de la API (ver backend/src/core/utils/serializers.ts). */
export interface PaginacionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginacionMeta;
  message?: string;
}

/** Una página de resultados. */
export interface Pagina<T> {
  items: T[];
  meta: PaginacionMeta;
}
