import { COLOR_ESTATUS, EstatusSolicitud, etiquetaEstatus } from '../../../../core/constants/estatus';

/** Chip de color con la etiqueta del estatus (ATENDIDA → "ATENDIDO", RECHAZADA → "NO PROCEDE"). */
export const EstatusChip = ({ estatus }: { estatus: string }) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
      COLOR_ESTATUS[estatus as EstatusSolicitud] || 'bg-slate-100'
    }`}
  >
    {etiquetaEstatus(estatus)}
  </span>
);
