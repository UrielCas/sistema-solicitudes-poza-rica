import { useRef, useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, FileText, Link2, Trash2, Upload } from 'lucide-react';
import { formatearFechaHora, formatearTamano } from '../../../../core/utils/formatters';
import { EXTENSIONES_EVIDENCIA } from '../../../../core/utils/validators';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { Alert, Button, Card, EstadoLista, claseControl } from '../../../../shared/components/ui';
import { gestionarEvidenciasUseCase } from '../../di';
import { Evidencia, nombreSubidoPor } from '../../domain/entities/Evidencia';
import { claves, useEvidencias } from '../hooks/useSolicitudes';

interface Props {
  solicitudId: string;
  /** Solo el Administrador puede eliminar evidencias. */
  puedeEliminar?: boolean;
  /** Enlaces heredados del formulario anterior (enlaceOficioDrive / enlaceEvidenciaDrive). */
  enlacesHeredados?: { nombre: string; enlace?: string }[];
}

/** Documentos de soporte de una solicitud: listar, subir archivo, agregar enlace, descargar, eliminar. */
export const EvidenciasPanel = ({ solicitudId, puedeEliminar = false, enlacesHeredados = [] }: Props) => {
  const qc = useQueryClient();
  const { data: evidencias = [], isLoading, isError, error } = useEvidencias(solicitudId);
  const inputArchivo = useRef<HTMLInputElement>(null);
  const [enlace, setEnlace] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const refrescar = () => qc.invalidateQueries({ queryKey: claves.evidencias(solicitudId) });
  const avisarError = (e: unknown) => setMensaje({ tipo: 'error', texto: mensajeDeError(e) });

  const subir = useMutation({
    mutationFn: (archivo: File) => gestionarEvidenciasUseCase.subir(solicitudId, archivo),
    onSuccess: (e) => {
      setMensaje({ tipo: 'exito', texto: `Se adjuntó "${e.nombre}".` });
      refrescar();
    },
    onError: avisarError,
  });

  const enlazar = useMutation({
    mutationFn: () => gestionarEvidenciasUseCase.enlazar(solicitudId, enlace),
    onSuccess: () => {
      setEnlace('');
      setMensaje({ tipo: 'exito', texto: 'Enlace agregado.' });
      refrescar();
    },
    onError: avisarError,
  });

  const descargar = useMutation({
    mutationFn: (e: Evidencia) => gestionarEvidenciasUseCase.descargar(solicitudId, e),
    onError: avisarError,
  });

  const eliminar = useMutation({
    mutationFn: (e: Evidencia) => gestionarEvidenciasUseCase.eliminar(solicitudId, e._id),
    onSuccess: () => {
      setMensaje({ tipo: 'exito', texto: 'Evidencia eliminada.' });
      refrescar();
    },
    onError: avisarError,
  });

  const heredados = enlacesHeredados.filter((h) => h.enlace);

  return (
    <Card titulo={`Evidencias y documentos (${evidencias.length + heredados.length})`}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputArchivo}
            type="file"
            className="hidden"
            accept={EXTENSIONES_EVIDENCIA.join(',')}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) subir.mutate(f);
              e.target.value = '';
            }}
          />
          <Button tamano="sm" onClick={() => inputArchivo.current?.click()} cargando={subir.isPending} textoCargando="Subiendo...">
            <Upload size={14} /> Subir archivo
          </Button>
          <form
            className="flex flex-1 min-w-[240px] gap-2"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              setMensaje(null);
              enlazar.mutate();
            }}
          >
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={enlace}
              onChange={(e) => setEnlace(e.target.value)}
              className={`${claseControl} !py-1.5`}
              aria-label="Enlace de evidencia"
            />
            <Button tamano="sm" variante="secundario" type="submit" cargando={enlazar.isPending} disabled={!enlace.trim()}>
              <Link2 size={14} /> Agregar enlace
            </Button>
          </form>
        </div>

        {mensaje && <Alert tipo={mensaje.tipo}>{mensaje.texto}</Alert>}

        {isLoading ? (
          <EstadoLista>Cargando evidencias...</EstadoLista>
        ) : isError ? (
          <Alert tipo="error">{mensajeDeError(error)}</Alert>
        ) : evidencias.length + heredados.length === 0 ? (
          <EstadoLista>Aún no hay documentos adjuntos.</EstadoLista>
        ) : (
          <ul className="divide-y divide-borde border border-borde rounded-lg">
            {heredados.map((h) => (
              <li key={h.nombre} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <Link2 size={16} className="text-guinda shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block font-medium truncate">{h.nombre}</span>
                  <span className="block text-[11px] text-texto-suave truncate">{h.enlace}</span>
                </span>
                <a href={h.enlace} target="_blank" rel="noreferrer noopener" className="p-1.5 text-guinda hover:bg-guinda/5 rounded-lg" aria-label="Abrir enlace">
                  <ExternalLink size={15} />
                </a>
              </li>
            ))}
            {evidencias.map((e) => (
              <li key={e._id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                {e.tipo === 'ARCHIVO' ? (
                  <FileText size={16} className="text-guinda shrink-0" />
                ) : (
                  <Link2 size={16} className="text-guinda shrink-0" />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block font-medium truncate">{e.nombre}</span>
                  <span className="block text-[11px] text-texto-suave">
                    {[e.tipo === 'ARCHIVO' && formatearTamano(e.tamano), nombreSubidoPor(e), formatearFechaHora(e.createdAt)]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  {e.descripcion && <span className="block text-xs text-texto-suave">{e.descripcion}</span>}
                </span>
                <button
                  type="button"
                  onClick={() => descargar.mutate(e)}
                  className="p-1.5 text-guinda hover:bg-guinda/5 rounded-lg cursor-pointer"
                  aria-label={e.tipo === 'ARCHIVO' ? `Descargar ${e.nombre}` : `Abrir ${e.nombre}`}
                >
                  {e.tipo === 'ARCHIVO' ? <Download size={15} /> : <ExternalLink size={15} />}
                </button>
                {puedeEliminar && (
                  <button
                    type="button"
                    onClick={() => window.confirm(`¿Eliminar "${e.nombre}"? No se puede deshacer.`) && eliminar.mutate(e)}
                    className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                    aria-label={`Eliminar ${e.nombre}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};
