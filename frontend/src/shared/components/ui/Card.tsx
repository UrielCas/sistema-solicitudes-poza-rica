import { ReactNode } from 'react';

interface CardProps {
  titulo?: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Contenedor blanco con borde, usado en paneles y secciones. */
export const Card = ({ titulo, acciones, children, className = '' }: CardProps) => (
  <section className={`bg-white rounded-xl border border-borde shadow-sm p-5 ${className}`}>
    {(titulo || acciones) && (
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        {titulo && <h2 className="font-bold text-base text-texto">{titulo}</h2>}
        {acciones}
      </div>
    )}
    {children}
  </section>
);

/** Tarjeta de cifra (dashboard). */
export const StatCard = ({ etiqueta, valor, color = 'text-texto' }: { etiqueta: string; valor: ReactNode; color?: string }) => (
  <div className="bg-white p-4 rounded-xl border border-borde">
    <div className="text-xs text-texto-suave">{etiqueta}</div>
    <strong className={`block text-2xl mt-1 ${color}`}>{valor}</strong>
  </div>
);

/** Encabezado de página: título, subtítulo y acciones a la derecha. */
export const PageHeader = ({ titulo, subtitulo, acciones }: { titulo: string; subtitulo?: ReactNode; acciones?: ReactNode }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 className="text-2xl font-bold text-texto">{titulo}</h1>
      {subtitulo && <p className="text-sm text-texto-suave">{subtitulo}</p>}
    </div>
    {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
  </div>
);
