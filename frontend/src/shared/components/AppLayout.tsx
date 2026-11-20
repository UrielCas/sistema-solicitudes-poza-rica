import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/presentation/store/useAuthStore';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();

  const navClass = (path: string, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path);
    return `block w-full text-left px-3.5 py-3 rounded-lg text-sm transition ${
      active
        ? 'bg-white/20 text-white font-bold'
        : 'text-white/85 hover:bg-white/10'
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-[#292b34]">
      <header className="bg-[#731936] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="font-bold tracking-wide text-sm md:text-base">
            GOBIERNO DE POZA RICA · SISTEMA 2027–2029
          </div>
          <div className="text-xs text-white/80">
            Registro, seguimiento y mapa consolidado de solicitudes
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/15 border border-white/30 rounded-full px-3.5 py-1.5 text-xs">
            {user?.nombre} · <strong>{user?.rol}</strong>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs bg-black/25 hover:bg-black/40 border border-white/25 rounded-lg cursor-pointer transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[235px_1fr]">
        <aside className="bg-[#4b1027] text-white p-3 space-y-1">
          <Link to="/dashboard" className={navClass('/dashboard')}>
            🗺️ Mapa general
          </Link>
          <Link to="/solicitudes" className={navClass('/solicitudes', true)}>
            📋 Solicitudes
          </Link>
          <Link to="/solicitudes/nueva" className={navClass('/solicitudes/nueva')}>
            ➕ Nueva solicitud
          </Link>
          <Link to="/areas" className={navClass('/areas')}>
            👥 Usuarios y áreas
          </Link>

          <div className="pt-6 px-3 text-xs text-[#e3cfd7] leading-relaxed hidden md:block">
            Sistema institucional conectado a MongoDB y API REST con control de acceso por rol.
          </div>
        </aside>

        <main className="p-5 md:p-7 min-w-0 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};