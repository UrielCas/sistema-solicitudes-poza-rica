import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { Alert, Button, Card, Select, Textarea } from '../../../../shared/components/ui';
import { useAreas } from '../../../catalogos/presentation/hooks/useCatalogos';
import { turnarSolicitudUseCase } from '../../di';

interface Props {
  solicitudId: string;
  areaActualId?: string | null;
  /** Una solicitud cerrada ya no se puede turnar. */
  deshabilitado?: boolean;
}

/** Formulario para turnar la solicitud a otra dependencia (TurnarScreen). */
export const TurnarForm = ({ solicitudId, areaActualId, deshabilitado }: Props) => {
  const qc = useQueryClient();
  const { areas } = useAreas();
  const [areaDestino, setAreaDestino] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [ok, setOk] = useState('');

  const turnar = useMutation({
    mutationFn: () => turnarSolicitudUseCase.execute({ solicitudId, areaActual: areaActualId, areaDestino, instrucciones }),
    onSuccess: (t) => {
      setOk(`Solicitud turnada a ${t.areaDestino?.nombre || 'la dependencia seleccionada'}.`);
      setInstrucciones('');
      setAreaDestino('');
      qc.invalidateQueries({ queryKey: ['turnados', solicitudId] });
      qc.invalidateQueries({ queryKey: ['solicitud', solicitudId] });
      qc.invalidateQueries({ queryKey: ['solicitudes'] });
      qc.invalidateQueries({ queryKey: ['reportes', 'dashboard'] });
    },
  });

  return (
    <Card titulo="Turnar a un área">
      <form
        className="space-y-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          setOk('');
          turnar.mutate();
        }}
      >
        <Select value={areaDestino} onChange={(e) => setAreaDestino(e.target.value)} disabled={deshabilitado} aria-label="Área destino">
          <option value="">Selecciona un área destino...</option>
          {areas
            .filter((a) => a._id !== areaActualId)
            .map((a) => (
              <option key={a._id} value={a._id}>
                {a.nombre} ({a.siglas})
              </option>
            ))}
        </Select>
        <Textarea
          rows={3}
          placeholder="Instrucciones para el área..."
          value={instrucciones}
          onChange={(e) => setInstrucciones(e.target.value)}
          disabled={deshabilitado}
          aria-label="Instrucciones"
        />
        {turnar.isError && <Alert tipo="error">{mensajeDeError(turnar.error)}</Alert>}
        {ok && <Alert tipo="exito">{ok}</Alert>}
        <Button type="submit" className="w-full" cargando={turnar.isPending} textoCargando="Turnando..." disabled={deshabilitado}>
          <Send size={15} /> Turnar solicitud
        </Button>
      </form>
    </Card>
  );
};
