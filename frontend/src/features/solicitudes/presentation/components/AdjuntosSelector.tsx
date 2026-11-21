import { useRef } from 'react';
import { Paperclip, X, FileText } from 'lucide-react';
import { formatearTamano } from '../../../../core/utils/formatters';
import { EXTENSIONES_EVIDENCIA, EVIDENCIA_MAX_MB, validarArchivoEvidencia } from '../../../../core/utils/validators';
import { Button } from '../../../../shared/components/ui';

interface Props {
  archivos: File[];
  onChange: (archivos: File[]) => void;
  max?: number;
}

/** Selector de archivos para adjuntar a la solicitud antes de guardarla. */
export const AdjuntosSelector = ({ archivos, onChange, max = 5 }: Props) => {
  const input = useRef<HTMLInputElement>(null);

  const agregar = (lista: FileList | null) => {
    if (!lista) return;
    const nuevos = Array.from(lista).filter((f) => !archivos.some((a) => a.name === f.name && a.size === f.size));
    onChange([...archivos, ...nuevos].slice(0, max));
    if (input.current) input.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        ref={input}
        type="file"
        multiple
        accept={EXTENSIONES_EVIDENCIA.join(',')}
        className="hidden"
        onChange={(e) => agregar(e.target.files)}
      />
      <Button variante="secundario" tamano="sm" onClick={() => input.current?.click()} disabled={archivos.length >= max}>
        <Paperclip size={14} /> Adjuntar archivos
      </Button>
      <p className="text-[11px] text-texto-suave">
        PDF, imagen (JPG, PNG, WEBP), Word o Excel · máximo {EVIDENCIA_MAX_MB} MB cada uno · hasta {max} archivos.
      </p>
      {archivos.length > 0 && (
        <ul className="space-y-1.5">
          {archivos.map((a, i) => {
            const error = validarArchivoEvidencia(a);
            return (
              <li
                key={`${a.name}-${a.size}`}
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-borde bg-fondo'}`}
              >
                <FileText size={14} className="shrink-0" />
                <span className="flex-1 truncate">{a.name}</span>
                <span className="text-texto-suave">{error || formatearTamano(a.size)}</span>
                <button
                  type="button"
                  onClick={() => onChange(archivos.filter((_, j) => j !== i))}
                  className="p-1 hover:text-guinda cursor-pointer"
                  aria-label={`Quitar ${a.name}`}
                >
                  <X size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
