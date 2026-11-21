import { useMemo, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { normalizar } from '../../../../core/utils/formatters';
import { AreaLogin } from '../../domain/entities/Area';
import { IconoArea } from './IconoArea';
import { claseInputLogin } from './CampoPassword';

interface Props {
  areas: AreaLogin[];
  cargando: boolean;
  error: boolean;
  onReintentar: () => void;
  onSeleccionar: (area: AreaLogin) => void;
}

/** Paso 1 del login: buscador + lista de direcciones con icono. */
export const SelectorDireccion = ({ areas, cargando, error, onReintentar, onSeleccionar }: Props) => {
  const [busqueda, setBusqueda] = useState('');

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return areas;
    return areas.filter((a) => normalizar(`${a.nombre} ${a.siglas}`).includes(q));
  }, [areas, busqueda]);

  return (
    <>
      <div className="relative mb-3">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a7f7a]" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar dirección..."
          aria-label="Buscar dirección"
          className={`${claseInputLogin} pl-11`}
        />
      </div>

      <ul
        role="listbox"
        aria-label="Direcciones municipales"
        className="scroll-guinda max-h-[352px] md:max-h-[max(220px,min(352px,calc(100vh-390px)))] overflow-y-auto pr-2 -mr-1 space-y-2.5 py-1"
      >
        {cargando &&
          Array.from({ length: 5 }).map((_, i) => <li key={i} className="h-[54px] rounded-xl bg-[#f4eeea] animate-pulse" />)}
        {error && (
          <li className="p-4 text-center text-sm text-red-700 bg-red-50 rounded-xl">
            No se pudo cargar el catálogo de direcciones.{' '}
            <button type="button" onClick={onReintentar} className="font-semibold underline cursor-pointer">
              Reintentar
            </button>
          </li>
        )}
        {!cargando && !error && filtradas.length === 0 && (
          <li className="p-4 text-center text-sm text-[#6f6a68]">Sin coincidencias para “{busqueda}”.</li>
        )}
        {filtradas.map((a) => (
          <li key={a._id} role="option" aria-selected={false}>
            <button
              type="button"
              onClick={() => onSeleccionar(a)}
              className="group w-full h-[54px] flex items-center gap-3.5 px-4 text-left bg-white border border-[#ebe3de] rounded-xl hover:border-guinda/40 hover:bg-[#fcf7f8] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-guinda/40 transition cursor-pointer"
            >
              <IconoArea siglas={a.siglas} />
              <span className="flex-1 font-display text-[12.5px] font-semibold uppercase tracking-wide text-[#3a3433] group-hover:text-guinda">
                {a.nombre}
              </span>
              <ChevronRight size={17} className="text-[#b9aeaa] group-hover:text-guinda group-hover:translate-x-0.5 transition" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};
