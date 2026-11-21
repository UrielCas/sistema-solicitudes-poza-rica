export interface Paginacion {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginacionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** ¿El cliente pidió paginación? (?page= o ?limit=). Sin ellos se devuelve la lista completa. */
export const pidePaginacion = (query: any) => query?.page !== undefined || query?.limit !== undefined;

/** Lee ?page y ?limit con valores seguros (page ≥ 1, 1 ≤ limit ≤ maxLimit). */
export const parsePagination = (query: any, { defaultLimit = 20, maxLimit = 100 } = {}): Paginacion => {
  const page = Math.max(1, Math.floor(Number(query?.page)) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Math.floor(Number(query?.limit)) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

export const buildMeta = (total: number, { page, limit }: Paginacion): PaginacionMeta => ({
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
