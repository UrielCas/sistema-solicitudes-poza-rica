import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rutaInicio } from '../../domain/entities/User';
import { PanelInstitucional } from '../components/PanelInstitucional';
import { LoginForm } from '../components/LoginForm';

/** Pantalla de acceso (LoginScreen): panel institucional + tarjeta de acceso. */
export const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const anterior = document.title;
    document.title = 'Acceso — Presidencia Municipal de Poza Rica';
    return () => {
      document.title = anterior;
    };
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[minmax(320px,26%)_1fr] font-sans text-texto">
      <PanelInstitucional />

      <section className="relative overflow-hidden bg-[url('/img/fondologin.jpeg')] bg-cover bg-center flex items-center justify-center px-4 py-8 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#f8f1ea_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-white/20" aria-hidden="true" />
        <p className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-display font-extrabold text-[64px] lg:text-[84px] tracking-wider text-guinda/[0.06] select-none pointer-events-none hidden md:block">
          POZA RICA, VERACRUZ
        </p>

        <LoginForm onIngreso={(s) => navigate(rutaInicio(s.user), { replace: true })} />
      </section>
    </div>
  );
};
