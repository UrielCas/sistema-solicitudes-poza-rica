const COLORES: Record<string, string> = {
  PENDIENTE: 'bg-red-100 text-red-800',
  RECIBIDA: 'bg-slate-100 text-slate-700',
  TURNADA: 'bg-[#f2e7ed] text-[#731936]',
  EN_PROCESO: 'bg-amber-100 text-amber-800',
  ATENDIDA: 'bg-emerald-100 text-emerald-700',
  RECHAZADA: 'bg-red-100 text-red-700',
  CERRADA: 'bg-purple-100 text-purple-700',
};

export const EstatusBadge = ({ estatus }: { estatus: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${COLORES[estatus] || 'bg-slate-100'}`}>
    {estatus.replace('_', ' ')}
  </span>
);