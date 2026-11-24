import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, ClipboardList, FilePlus2, Library, ScrollText, KeyRound, LogOut } from 'lucide-react';
import { TEXTOS } from '../../core/constants/strings';
import { useAuthStore } from '../../features/auth/presentation/store/useAuthStore';
import { esAdmin } from '../../features/auth/domain/entities/User';
import { logoutUseCase } from '../../features/auth/di';
import { CampanaNotificaciones } from '../../features/notificaciones/presentation/components/CampanaNotificaciones';

const MENU_ADMIN = [
  { to: '/dashboard', texto: 'Mapa general', Icono: Map },
  { to: '/solicitudes', texto: 'Solicitudes', Icono: ClipboardList, exacto: true },
  { to: '/solicitudes/nueva', texto: 'Nueva solicitud', Icono: FilePlus2 },
  { to: '/catalogos', texto: 'Catálogos', Icono: Library },
  { to: '/bitacora', texto: 'Bitácora', Icono: ScrollText },
  { to: '/cuenta', texto: 'Mi cuenta', Icono: KeyRound },
];

/** Marco de las pantallas internas: encabezado guinda, menú del Administrador y fondo de flores para áreas. */
export const AppLayout = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const admin = esAdmin(user);

  const activo = (to: string, exacto?: boolean) =>
    exacto ? pathname === to : pathname.startsWith(to) && !(to === '/solicitudes' && pathname === '/solicitudes/nueva');

  const salir = () => {
    logoutUseCase.execute();
    navigate('/login', { replace: true });
  };

  const etiquetaCuenta = admin ? 'Administrador' : user?.area?.nombre || user?.nombre;

  return (
    <div className="min-h-screen flex flex-col bg-fondo text-texto">
      <header className="bg-guinda text-white px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm relative z-[1001]">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/img/flor-institucional.png" alt="" aria-hidden="true" className="w-8 h-8 brightness-0 invert opacity-90 hidden sm:block" />
          <div className="min-w-0">
            <div className="font-bold tracking-wide text-sm md:text-base truncate">
              {TEXTOS.gobierno} · SISTEMA {TEXTOS.periodoSistema}
            </div>
            <div className="text-xs text-white/80">
              {admin ? 'Registro, seguimiento y mapa consolidado de solicitudes' : 'Captura de solicitudes por área municipal'}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white/15 border border-white/30 rounded-full px-3.5 py-1.5 text-xs max-w-full truncate">
            <strong>{etiquetaCuenta}</strong>
            <span className="text-white/75 hidden sm:inline"> · {user?.email}</span>
          </div>
          <CampanaNotificaciones />
          {!admin && (
            <Link
              to="/cuenta"
              className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg transition"
            >
              Cambiar usuario / contraseña
            </Link>
          )}
          <button
            onClick={salir}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-black/25 hover:bg-black/40 border border-white/25 rounded-lg cursor-pointer transition"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </header>

      {user?.debeCambiarPassword && pathname !== '/cuenta' && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-sm text-amber-900 flex flex-wrap items-center gap-2 relative z-10">
          Estás usando la contraseña inicial de tu cuenta. Por seguridad, cámbiala ahora.
          <Link to="/cuenta" className="font-semibold underline">
            Cambiar usuario / contraseña
          </Link>
        </div>
      )}

      {admin ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[235px_1fr]">
          <nav aria-label="Menú principal" className="bg-guinda-oscuro text-white p-3 flex md:flex-col gap-1 overflow-x-auto">
            {MENU_ADMIN.map(({ to, texto, Icono, exacto }) => (
              <Link
                key={to}
                to={to}
                aria-current={activo(to, exacto) ? 'page' : undefined}
                className={`flex items-center gap-2.5 whitespace-nowrap px-3.5 py-3 rounded-lg text-sm transition ${
                  activo(to, exacto) ? 'bg-white/20 text-white font-bold' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <Icono size={17} /> {texto}
              </Link>
            ))}
          </nav>
          <main className="p-4 md:p-7 min-w-0 max-w-[1600px] w-full mx-auto">{children}</main>
        </div>
      ) : (
        // Áreas municipales: sin menú lateral, con fondo animado de flores institucionales girando.
        <main className="relative flex-1 p-4 md:p-7 min-w-0 w-full overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
            {/* Flor superior izquierda (520px, giro horario) */}
            <img
              src="/img/flor-institucional.png"
              alt=""
              className="flor-giro-normal fixed -left-[190px] -top-[140px] w-[520px] h-[520px] object-contain opacity-10 select-none"
            />
            {/* Flor inferior derecha (380px, giro antihorario) */}
            <img
              src="/img/flor-institucional.png"
              alt=""
              className="flor-giro-inverso fixed -right-[150px] -bottom-[170px] w-[380px] h-[380px] object-contain opacity-[0.08] select-none"
            />
            {/* Flor superior derecha (210px, giro horario) */}
            <img
              src="/img/flor-institucional.png"
              alt=""
              className="flor-giro-normal fixed -right-[70px] -top-[20px] w-[210px] h-[210px] object-contain opacity-[0.06] select-none"
            />
          </div>

          <div className="relative z-10">{children}</div>
        </main>
      )}
    </div>
  );
};