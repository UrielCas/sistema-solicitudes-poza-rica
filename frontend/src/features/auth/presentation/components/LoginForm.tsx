import { useRef, useState, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, LogIn, Landmark, UserCog } from 'lucide-react';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { loginUseCase, obtenerAreasLoginUseCase } from '../../di';
import { AreaLogin } from '../../domain/entities/Area';
import { Sesion } from '../../domain/entities/User';
import { SelectorDireccion } from './SelectorDireccion';
import { CampoPassword, claseInputLogin } from './CampoPassword';
import { IconoArea } from './IconoArea';

/** Paso numerado ("1 SELECCIONA TU DIRECCIÓN"). */
const Paso = ({ n, texto }: { n: number; texto: string }) => (
  <div className="flex items-center justify-center gap-2.5 mb-4">
    <span className="w-7 h-7 rounded-full bg-guinda text-white text-xs font-bold flex items-center justify-center shadow-sm">
      {n}
    </span>
    <span className="font-display text-[13px] font-bold tracking-[0.12em] text-guinda">{texto}</span>
  </div>
);

/** Tarjeta de acceso: por dirección (2 pasos) o como Administrador. */
export const LoginForm = ({ onIngreso }: { onIngreso: (sesion: Sesion) => void }) => {
  const [modoAdmin, setModoAdmin] = useState(false);
  const [area, setArea] = useState<AreaLogin | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const areas = useQuery({ queryKey: ['areas-login'], queryFn: () => obtenerAreasLoginUseCase.execute() });

  const seleccionarArea = (a: AreaLogin) => {
    setArea(a);
    setError('');
    setPassword('');
    setTimeout(() => passwordRef.current?.focus(), 0);
  };

  const cambiarModo = () => {
    setModoAdmin((m) => !m);
    setArea(null);
    setError('');
    setPassword('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const sesion = await loginUseCase.execute(
        modoAdmin ? { modo: 'ADMIN', email, password } : { modo: 'AREA', areaId: area?._id, password }
      );
      onIngreso(sesion);
    } catch (err) {
      setError(mensajeDeError(err, 'Error al iniciar sesión'));
    } finally {
      setEnviando(false);
    }
  };

  const botonIngresar = (
    <button
      type="submit"
      disabled={enviando}
      className="w-full h-12 flex items-center justify-center gap-2 bg-guinda hover:bg-guinda-oscuro text-white font-display font-bold text-sm tracking-wide rounded-xl shadow-md shadow-guinda/20 transition disabled:opacity-60 cursor-pointer"
    >
      <LogIn size={17} />
      {enviando ? 'Ingresando...' : 'Ingresar'}
    </button>
  );

  return (
    <div className="relative w-full max-w-[580px] bg-white rounded-[22px] shadow-[0_20px_50px_-12px_rgba(75,16,39,0.25)] overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-guinda via-[#9b3a52] to-dorado" />

      <div className="px-6 sm:px-14 pt-8 pb-6">
        <div className="flex flex-col items-center text-center mb-7">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f8efdf] border border-[#e6cfa8] text-[11px] font-display font-bold tracking-[0.1em] text-guinda">
            <Landmark size={14} strokeWidth={2.2} aria-hidden="true" />
            SISTEMA DE SOLICITUDES
          </span>
          <h2 className="font-display text-[26px] font-extrabold text-guinda mt-4">
            {modoAdmin ? 'Acceso Administrador' : 'Acceso al Sistema'}
          </h2>
          <p className="text-[15px] text-[#6f6a68] mt-1.5">
            {modoAdmin
              ? 'Ingresa con el correo y contraseña de administración'
              : 'Selecciona tu dirección e ingresa tus credenciales'}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate={!modoAdmin}>
          {modoAdmin ? (
            <div className="space-y-3.5">
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={claseInputLogin}
                placeholder="Correo electrónico"
                aria-label="Correo electrónico"
              />
              <CampoPassword value={password} onChange={setPassword} />
              {botonIngresar}
            </div>
          ) : !area ? (
            <>
              <Paso n={1} texto="SELECCIONA TU DIRECCIÓN" />
              <SelectorDireccion
                areas={areas.data ?? []}
                cargando={areas.isLoading}
                error={areas.isError}
                onReintentar={() => areas.refetch()}
                onSeleccionar={seleccionarArea}
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3.5 px-4 h-[58px] mb-6 rounded-xl border border-guinda/30 bg-[#fcf7f8]">
                <IconoArea siglas={area.siglas} activo />
                <span className="flex-1 font-display text-[12.5px] font-bold uppercase tracking-wide text-guinda">{area.nombre}</span>
                <button
                  type="button"
                  onClick={() => {
                    setArea(null);
                    setPassword('');
                    setError('');
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-[#6f6a68] hover:text-guinda cursor-pointer"
                >
                  <ArrowLeft size={14} /> Cambiar
                </button>
              </div>
              <Paso n={2} texto="INGRESA TU CONTRASEÑA" />
              <div className="space-y-3.5">
                <CampoPassword ref={passwordRef} value={password} onChange={setPassword} />
                {botonIngresar}
              </div>
            </>
          )}
        </form>
      </div>

      <div className="border-t border-[#efe8e4] py-4 text-center">
        <button
          type="button"
          onClick={cambiarModo}
          className="inline-flex items-center gap-2 font-display text-[13px] font-bold text-guinda hover:text-guinda-oscuro hover:underline underline-offset-4 cursor-pointer"
        >
          {modoAdmin ? <ArrowLeft size={16} /> : <UserCog size={16} />}
          {modoAdmin ? 'Volver al acceso por dirección' : 'Acceso Administrador'}
        </button>
      </div>
    </div>
  );
};
