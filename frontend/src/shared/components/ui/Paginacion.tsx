import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginacionMeta } from '../../types/ApiResponse';

export const Paginacion = ({ meta, onCambiar }: { meta?: PaginacionMeta; onCambiar: (page: number) => void }) => {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = meta;
  const desde = (page - 1) * limit + 1;
  const hasta = Math.min(page * limit, total);
  const boton =
    'p-1.5 rounded-lg border border-borde bg-white hover:border-guinda hover:text-guinda disabled:opacity-40 disabled:hover:border-borde disabled:hover:text-inherit cursor-pointer disabled:cursor-default';
  return (
    <nav className="flex items-center justify-between gap-3 text-xs text-texto-suave px-1" aria-label="Paginación">
      <span>
        {desde}–{hasta} de {total}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" className={boton} disabled={page <= 1} onClick={() => onCambiar(page - 1)} aria-label="Página anterior">
          <ChevronLeft size={16} />
        </button>
        <span className="font-semibold text-texto">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className={boton}
          disabled={page >= totalPages}
          onClick={() => onCambiar(page + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};
