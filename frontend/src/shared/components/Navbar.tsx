import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/presentation/store/useAuthStore';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      pathname.startsWith(path)
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base font-bold text-slate-800">Sistema de Solicitudes</h1>
          <p className="text-xs text-slate-500">H. Ayuntamiento de Poza Rica</p>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          <Link to="/solicitudes" className={linkClass('/solicitudes')}>Solicitudes</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-600">
          {user?.nombre} <strong className="text-slate-800">({user?.rol})</strong>
        </span>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
        >
          Salir
        </button>
      </div>
    </header>
  );
};