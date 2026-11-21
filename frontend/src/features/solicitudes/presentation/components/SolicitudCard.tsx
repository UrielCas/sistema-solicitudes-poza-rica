import { Link } from 'react-router-dom';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import { formatearFecha } from '../../../../core/utils/formatters';
import { Solicitud } from '../../domain/entities/Solicitud';
import { EstatusChip } from './EstatusChip';

/** Tarjeta de solicitud (vista de celular de la bandeja). */
export const SolicitudCard = ({ solicitud: s }: { solicitud: Solicitud }) => (
  <Link
    to={`/solicitudes/${s._id}`}
    className="block bg-white rounded-xl border border-borde p-4 hover:border-guinda/40 hover:shadow-sm transition"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-sm font-bold text-guinda">{s.folio}</p>
        <p className="font-semibold text-sm mt-0.5 truncate">{s.tipoSolicitud}</p>
        <p className="text-xs text-texto-suave truncate">{s.solicitante}</p>
      </div>
      <EstatusChip estatus={s.estatus} />
    </div>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-suave">
      <span className="inline-flex items-center gap-1">
        <Building2 size={13} /> {s.areaActual?.nombre || 'Sin asignar'}
      </span>
      <span className="inline-flex items-center gap-1">
        <MapPin size={13} /> {s.domicilio?.colonia || '—'}
        {s.zona ? ` · ${s.zona}` : ''}
      </span>
      <span>{formatearFecha(s.fechaRecepcion)}</span>
      <ChevronRight size={14} className="ml-auto text-guinda" />
    </div>
  </Link>
);
