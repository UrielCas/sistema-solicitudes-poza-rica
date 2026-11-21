import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/presentation/store/useAuthStore';
import { Rol, rutaInicio } from '../features/auth/domain/entities/User';
import { LoginPage } from '../features/auth/presentation/pages/LoginPage';
import { PerfilPage } from '../features/perfil/presentation/pages/PerfilPage';
import { DashboardPage } from '../features/dashboard/presentation/pages/DashboardPage';
import { SolicitudListPage } from '../features/solicitudes/presentation/pages/SolicitudListPage';
import { NuevaSolicitudPage } from '../features/solicitudes/presentation/pages/NuevaSolicitudPage';
import { SolicitudDetailPage } from '../features/solicitudes/presentation/pages/SolicitudDetailPage';
import { CatalogosPage } from '../features/catalogos/presentation/pages/CatalogosPage';
import { AuditoriaPage } from '../features/reportes/presentation/pages/AuditoriaPage';

/** Guard: exige sesión y, si se indica, uno de los roles permitidos. */
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: Rol[] }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  // Un área municipal que intente entrar a una vista de Administrador vuelve a su captura.
  if (allowedRoles && !allowedRoles.includes(user.rol)) return <Navigate to={rutaInicio(user)} replace />;
  return <Outlet />;
};

const HomeRedirect = () => {
  const { user, accessToken } = useAuthStore();
  return <Navigate to={accessToken && user ? rutaInicio(user) : '/login'} replace />;
};

const LoginRoute = () => {
  const { user, accessToken } = useAuthStore();
  if (accessToken && user) return <Navigate to={rutaInicio(user)} replace />;
  return <LoginPage />;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      {/* Cualquier cuenta autenticada (áreas municipales y Administrador) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/solicitudes/nueva" element={<NuevaSolicitudPage />} />
        <Route path="/cuenta" element={<PerfilPage />} />
      </Route>

      {/* Solo Administrador */}
      <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN']} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/solicitudes" element={<SolicitudListPage />} />
        <Route path="/solicitudes/:id" element={<SolicitudDetailPage />} />
        <Route path="/catalogos" element={<CatalogosPage />} />
        <Route path="/bitacora" element={<AuditoriaPage />} />
        <Route path="/areas" element={<Navigate to="/catalogos" replace />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  </BrowserRouter>
);
