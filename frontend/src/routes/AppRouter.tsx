import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/presentation/store/useAuthStore';
import { LoginPage } from '../features/auth/presentation/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/presentation/pages/DashboardPage';
import { SolicitudListPage } from '../features/solicitudes/presentation/pages/SolicitudListPage';
import { NuevaSolicitudPage } from '../features/solicitudes/presentation/pages/NuevaSolicitudPage';
import { SolicitudDetailPage } from '../features/solicitudes/presentation/pages/SolicitudDetailPage';
import { AreasPage } from '../features/areas/AreasPage';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.rol)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/solicitudes" element={<SolicitudListPage />} />
        <Route path="/solicitudes/nueva" element={<NuevaSolicitudPage />} />
        <Route path="/solicitudes/:id" element={<SolicitudDetailPage />} />
        <Route path="/areas" element={<AreasPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);