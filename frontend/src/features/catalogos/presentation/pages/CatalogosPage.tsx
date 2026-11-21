import { useState, FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Check, X, Plus } from 'lucide-react';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { Alert, Button, Card, EstadoLista, PageHeader, claseControl } from '../../../../shared/components/ui';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { crearAreaUseCase, gestionarCatalogoUseCase } from '../../di';
import { NOMBRE_CATALOGO, TipoCatalogo, ValorCatalogo } from '../../domain/entities/Catalogo';
import { CLAVE_AREAS, CLAVE_CATALOGOS, useAreas } from '../hooks/useCatalogos';

type Pestana = 'AREAS' | TipoCatalogo;

const PESTANAS: { id: Pestana; nombre: string }[] = [
  { id: 'AREAS', nombre: 'Dependencias' },
  { id: 'TIPO_SOLICITUD', nombre: NOMBRE_CATALOGO.TIPO_SOLICITUD },
  { id: 'TIPO_PETICION', nombre: NOMBRE_CATALOGO.TIPO_PETICION },
  { id: 'PRIORIDAD', nombre: NOMBRE_CATALOGO.PRIORIDAD },
];

/** Alta de dependencias municipales. */
const PanelAreas = () => {
  const qc = useQueryClient();
  const { areas, isLoading } = useAreas();
  const [nombre, setNombre] = useState('');
  const [siglas, setSiglas] = useState('');

  const crear = useMutation({
    mutationFn: () => crearAreaUseCase.execute(nombre, siglas),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLAVE_AREAS });
      qc.invalidateQueries({ queryKey: ['areas-login'] });
      setNombre('');
      setSiglas('');
    },
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          crear.mutate();
        }}
        className="flex flex-wrap gap-3"
      >
        <input
          placeholder="Nombre de la nueva dependencia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={`${claseControl} flex-1 min-w-[220px] !w-auto`}
          aria-label="Nombre de la dependencia"
        />
        <input
          placeholder="Siglas"
          value={siglas}
          onChange={(e) => setSiglas(e.target.value)}
          className={`${claseControl} !w-28`}
          aria-label="Siglas"
        />
        <Button type="submit" cargando={crear.isPending}>
          <Plus size={16} /> Agregar dependencia
        </Button>
      </form>
      {crear.isError && <Alert tipo="error">{mensajeDeError(crear.error)}</Alert>}
      <p className="text-xs text-texto-suave">
        Una dependencia nueva aparece en el login cuando el Administrador le crea una cuenta.
      </p>

      <div className="divide-y divide-borde border border-borde rounded-lg">
        {isLoading && <EstadoLista>Cargando dependencias...</EstadoLista>}
        {areas.map((a, i) => (
          <div key={a._id} className="px-4 py-3 flex items-center justify-between text-sm">
            <span>
              <strong className="text-guinda mr-2">{i + 1}.</strong>
              {a.nombre}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-guinda-claro text-guinda">{a.siglas}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Fila editable de un valor de catálogo. */
const FilaValor = ({ item, onCambio }: { item: ValorCatalogo; onCambio: () => void }) => {
  const [editando, setEditando] = useState(false);
  const [etiqueta, setEtiqueta] = useState(item.etiqueta);

  const renombrar = useMutation({
    mutationFn: () => gestionarCatalogoUseCase.renombrar(item, etiqueta),
    onSuccess: () => {
      setEditando(false);
      onCambio();
    },
  });
  const alternar = useMutation({ mutationFn: () => gestionarCatalogoUseCase.alternarActivo(item), onSuccess: onCambio });
  const error = renombrar.error || alternar.error;

  return (
    <div className={`px-4 py-2.5 text-sm ${item.activo ? '' : 'bg-slate-50 text-texto-suave'}`}>
      <div className="flex flex-wrap items-center gap-3">
        {editando ? (
          <input
            autoFocus
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), renombrar.mutate())}
            className={`${claseControl} flex-1 min-w-[180px] !w-auto !py-1.5`}
            aria-label="Nueva etiqueta"
          />
        ) : (
          <span className="flex-1 min-w-[180px]">
            {item.etiqueta}
            {item.etiqueta !== item.valor && <span className="text-[11px] text-texto-suave ml-2">({item.valor})</span>}
            {!item.activo && <span className="ml-2 text-[11px] font-semibold uppercase">· inactivo</span>}
          </span>
        )}
        <div className="flex gap-1.5">
          {editando ? (
            <>
              <Button tamano="sm" onClick={() => renombrar.mutate()} cargando={renombrar.isPending} aria-label="Guardar">
                <Check size={14} />
              </Button>
              <Button
                tamano="sm"
                variante="fantasma"
                onClick={() => {
                  setEditando(false);
                  setEtiqueta(item.etiqueta);
                }}
                aria-label="Cancelar"
              >
                <X size={14} />
              </Button>
            </>
          ) : (
            <Button tamano="sm" variante="fantasma" onClick={() => setEditando(true)}>
              <Pencil size={13} /> Renombrar
            </Button>
          )}
          {item.tipo !== 'PRIORIDAD' && !editando && (
            <Button tamano="sm" variante={item.activo ? 'peligro' : 'secundario'} onClick={() => alternar.mutate()} cargando={alternar.isPending}>
              {item.activo ? 'Desactivar' : 'Activar'}
            </Button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-700 mt-1">{mensajeDeError(error)}</p>}
    </div>
  );
};

/** Lista de un catálogo con alta de valores. */
const PanelCatalogo = ({ tipo }: { tipo: TipoCatalogo }) => {
  const qc = useQueryClient();
  const clave = ['catalogos', 'admin', tipo];
  const { data = [], isLoading, isError, error } = useQuery({ queryKey: clave, queryFn: () => gestionarCatalogoUseCase.listar(tipo) });
  const [nuevo, setNuevo] = useState('');

  const refrescar = () => {
    qc.invalidateQueries({ queryKey: clave });
    qc.invalidateQueries({ queryKey: CLAVE_CATALOGOS });
  };

  const agregar = useMutation({
    mutationFn: () => gestionarCatalogoUseCase.agregar(tipo, nuevo),
    onSuccess: () => {
      setNuevo('');
      refrescar();
    },
  });

  return (
    <div className="space-y-4">
      {tipo === 'PRIORIDAD' ? (
        <Alert tipo="info">Las prioridades están ligadas al flujo de las solicitudes: solo se pueden renombrar.</Alert>
      ) : (
        <>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              agregar.mutate();
            }}
            className="flex flex-wrap gap-3"
          >
            <input
              placeholder={`Nuevo valor en ${NOMBRE_CATALOGO[tipo].toLowerCase()}`}
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
              className={`${claseControl} flex-1 min-w-[220px] !w-auto`}
              aria-label="Nuevo valor"
            />
            <Button type="submit" cargando={agregar.isPending}>
              <Plus size={16} /> Agregar
            </Button>
          </form>
          {agregar.isError && <Alert tipo="error">{mensajeDeError(agregar.error)}</Alert>}
          <p className="text-xs text-texto-suave">
            Los valores desactivados dejan de aparecer en el formulario, pero las solicitudes que ya los usan no cambian.
          </p>
        </>
      )}

      <div className="divide-y divide-borde border border-borde rounded-lg">
        {isLoading && <EstadoLista>Cargando...</EstadoLista>}
        {isError && <EstadoLista>{mensajeDeError(error)}</EstadoLista>}
        {data.map((item) => (
          <FilaValor key={`${item._id}-${item.etiqueta}-${item.activo}`} item={item} onCambio={refrescar} />
        ))}
      </div>
    </div>
  );
};

/** Catálogos del sistema (solo Administrador): dependencias, tipos de solicitud/petición y prioridades. */
export const CatalogosPage = () => {
  const [pestana, setPestana] = useState<Pestana>('AREAS');

  return (
    <AppLayout>
      <div className="space-y-5 max-w-4xl">
        <PageHeader titulo="Catálogos" subtitulo="Dependencias y valores homologados que usa el formulario de captura" />

        <div role="tablist" className="flex flex-wrap gap-1 border-b border-borde">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={pestana === p.id}
              onClick={() => setPestana(p.id)}
              className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 cursor-pointer transition ${
                pestana === p.id ? 'border-guinda text-guinda' : 'border-transparent text-texto-suave hover:text-guinda'
              }`}
            >
              {p.nombre}
            </button>
          ))}
        </div>

        <Card>{pestana === 'AREAS' ? <PanelAreas /> : <PanelCatalogo key={pestana} tipo={pestana} />}</Card>
      </div>
    </AppLayout>
  );
};
