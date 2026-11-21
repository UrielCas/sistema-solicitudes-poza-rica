import { ReactNode } from 'react';

type Tipo = 'info' | 'exito' | 'aviso' | 'error';

const ESTILOS: Record<Tipo, string> = {
  info: 'bg-slate-50 border-slate-200 text-slate-700',
  exito: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  aviso: 'bg-amber-50 border-amber-200 text-amber-900',
  error: 'bg-red-50 border-red-200 text-red-700',
};

export const Alert = ({ tipo = 'info', children, className = '' }: { tipo?: Tipo; children: ReactNode; className?: string }) => (
  <div role={tipo === 'error' ? 'alert' : 'status'} className={`p-3 rounded-lg border text-sm ${ESTILOS[tipo]} ${className}`}>
    {children}
  </div>
);

/** Estado vacío / cargando de una lista. */
export const EstadoLista = ({ children }: { children: ReactNode }) => (
  <p className="p-8 text-center text-sm text-texto-suave">{children}</p>
);
