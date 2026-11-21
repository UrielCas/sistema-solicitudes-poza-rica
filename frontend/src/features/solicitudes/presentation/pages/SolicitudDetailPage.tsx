import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { Alert, Button, Card, EstadoLista } from '../../../../shared/components/ui';
import { ESTATUS_BANDEJA, etiquetaEstatus } from '../../../../core/constants/estatus';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { formatearFecha } from '../../../../core/utils/formatters';
import { TurnarForm } from '../../../turnados/presentation/components/TurnarForm';
import { HistorialTimeline } from '../../../turnados/presentation/components/HistorialTimeline';
import { cambiarEstatusUseCase } from '../../di';
import { coordenadaDe } from '../../domain/entities/Solicitud';
import { EstatusChip } from '../components/EstatusChip';
import { EvidenciasPanel } from '../components/EvidenciasPanel';
import { useCambiarEstatus, useSolicitud } from '../hooks/useSolicitudes';

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor?: React.ReactNode }) => (
  <div>
    <dt className="text-[11px] font-semibold text-texto-suave uppercase tracking-wide">{etiqueta}</dt>
    <dd className="text-sm mt-0.5">{valor || '—'}</dd>
  </div>
);

/** Expediente de una solicitud (SolicitudDetailScreen): datos, estatus, evidencias y turnados. */
export const SolicitudDetailPage = () => {
  const { id = '' } = useParams();
  const { data: s, isLoading, isError, error } = useSolicitud(id);
  const estatus = useCambiarEstatus(s);

  if (isLoading || isError || !s) {
    return (
      <AppLayout>
        <Link to="/solicitudes" className="inline-flex items-center gap-1 text-sm text-guinda hover:underline mb-4">
          <ArrowLeft size={15} /> Volver al listado
        </Link>
        {isError ? <Alert tipo="error">{mensajeDeError(error)}</Alert> : <EstadoLista>Cargando expediente...</EstadoLista>}
      </AppLayout>
    );
  }

  const coord = coordenadaDe(s);
  const d = s.domicilio;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        <Link to="/solicitudes" className="inline-flex items-center gap-1 text-sm text-guinda hover:underline">
          <ArrowLeft size={15} /> Volver al listado
        </Link>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="font-mono text-sm text-guinda font-bold">{s.folio}</span>
              <h1 className="text-xl font-bold">{s.tipoSolicitud}</h1>
              <p className="text-xs text-texto-suave">
                {s.tipoPeticion} · Prioridad {s.prioridad.toLowerCase()} · Recibida el {formatearFecha(s.fechaRecepcion)}
              </p>
            </div>
            <EstatusChip estatus={s.estatus} />
          </div>

          <p className="text-sm text-texto mt-4 whitespace-pre-line">{s.descripcion}</p>

          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-borde">
            <Dato etiqueta="Solicitante" valor={s.solicitante} />
            <Dato etiqueta="Contacto" valor={s.contacto} />
            <Dato etiqueta="Área actual" valor={s.areaActual?.nombre || 'Sin asignar'} />
            <Dato etiqueta="Corresponsables" valor={s.areasCorresponsables?.map((a) => a.siglas).join(', ')} />
            <Dato etiqueta="Folio de Oficialía" valor={s.folioOficialia} />
            <Dato etiqueta="Persona encargada" valor={s.personaEncargada} />
            <Dato etiqueta="Fecha de atención" valor={s.fechaAtencion && formatearFecha(s.fechaAtencion)} />
            <Dato etiqueta="Capturó" valor={s.creadoPor?.nombre} />
          </dl>

          <div className="pt-4 mt-4 border-t border-borde space-y-1">
            <p className="text-[11px] font-semibold text-texto-suave uppercase tracking-wide">Domicilio</p>
            <p className="text-sm">
              {d.callePrincipal} {d.numeroExterior}
              {d.entreCalle && `, entre ${d.entreCalle}`}
              {d.yCalle && ` y ${d.yCalle}`} · Col. {d.colonia} · C.P. {d.codigoPostal}
            </p>
            <p className="text-xs text-texto-suave">{d.referencias}</p>
            {coord && (
              <p className="text-xs text-texto-suave flex flex-wrap items-center gap-1">
                <MapPin size={13} className="text-guinda" /> {coord[0]}, {coord[1]}
                {(s.geo?.zona || s.zona) && ` · ${s.geo?.zona || s.zona}`} ·{' '}
                <a
                  className="underline text-guinda"
                  target="_blank"
                  rel="noreferrer noopener"
                  href={`https://www.openstreetmap.org/?mlat=${coord[0]}&mlon=${coord[1]}#map=18/${coord[0]}/${coord[1]}`}
                >
                  ver en mapa
                </a>
              </p>
            )}
          </div>

          {/* Bandeja de seguimiento: actualización de estatus */}
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-borde">
            <span className="text-xs font-semibold text-texto-suave">Actualizar estatus:</span>
            {ESTATUS_BANDEJA.map((e) => (
              <Button
                key={e}
                tamano="sm"
                variante={s.estatus === e ? 'primario' : 'secundario'}
                disabled={estatus.isPending || !cambiarEstatusUseCase.puedeCambiar(s, e)}
                onClick={() => estatus.mutate(e)}
                aria-pressed={s.estatus === e}
              >
                {etiquetaEstatus(e)}
              </Button>
            ))}
          </div>
          {estatus.isError && <p className="text-xs text-red-700 mt-2">{mensajeDeError(estatus.error)}</p>}
        </Card>

        <EvidenciasPanel
          solicitudId={s._id}
          puedeEliminar
          enlacesHeredados={[
            { nombre: 'Oficio (Drive)', enlace: s.enlaceOficioDrive },
            { nombre: 'Evidencia (Drive)', enlace: s.enlaceEvidenciaDrive },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TurnarForm solicitudId={s._id} areaActualId={s.areaActual?._id} deshabilitado={s.estatus === 'CERRADA'} />
          <HistorialTimeline solicitudId={s._id} />
        </div>
      </div>
    </AppLayout>
  );
};
