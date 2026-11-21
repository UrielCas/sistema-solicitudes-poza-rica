import { useMutation } from '@tanstack/react-query';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { Button } from '../../../../shared/components/ui';
import { exportarReporteUseCase } from '../../di';
import { FormatoReporte } from '../../domain/entities/Reporte';
import { FiltrosReporte } from '../../domain/repositories/ReportesRepository';

/** Botones "Exportar Excel" y "Exportar PDF" (respetan los filtros que se le pasen). */
export const BotonesExportar = ({ filtros = {} }: { filtros?: FiltrosReporte }) => {
  const exportar = useMutation({ mutationFn: (f: FormatoReporte) => exportarReporteUseCase.execute(f, filtros) });
  const formato = exportar.isPending ? exportar.variables : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button variante="exito" onClick={() => exportar.mutate('excel')} cargando={formato === 'excel'} textoCargando="Generando..." disabled={exportar.isPending}>
          <FileSpreadsheet size={16} /> Excel
        </Button>
        <Button variante="secundario" onClick={() => exportar.mutate('pdf')} cargando={formato === 'pdf'} textoCargando="Generando..." disabled={exportar.isPending}>
          <FileText size={16} /> PDF
        </Button>
      </div>
      {exportar.isError && <p className="text-xs text-red-700">{mensajeDeError(exportar.error)}</p>}
    </div>
  );
};
