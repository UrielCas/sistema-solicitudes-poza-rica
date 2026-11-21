import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { Alert, Button, Input } from '../../../../shared/components/ui';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { useAuthStore } from '../../../auth/presentation/store/useAuthStore';
import { rutaInicio } from '../../../auth/domain/entities/User';
import { actualizarCredencialesUseCase } from '../../di';
import { FormCredenciales } from '../../domain/usecases/ActualizarCredencialesUseCase';

const VACIO: FormCredenciales = { passwordActual: '', nuevoEmail: '', nuevaPassword: '', confirmacion: '' };

/** "Cambiar usuario / contraseña" de la cuenta en sesión. */
export const PerfilPage = () => {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);

  const campo = (k: keyof FormCredenciales) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setOk('');
    setGuardando(true);
    try {
      await actualizarCredencialesUseCase.execute(form);
      setOk('Tus credenciales se actualizaron correctamente.');
      setForm(VACIO);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-borde shadow-sm p-6 md:p-8 space-y-5">
        <div className="border-b border-borde pb-4">
          <h1 className="text-xl font-bold text-guinda">Cambiar usuario / contraseña</h1>
          <p className="text-sm text-texto-suave mt-1">
            {user?.area?.nombre || user?.nombre} · usuario actual: <strong>{user?.email}</strong>
          </p>
        </div>

        {error && <Alert tipo="error">{error}</Alert>}
        {ok && (
          <Alert tipo="exito">
            {ok}{' '}
            <Link to={rutaInicio(user)} className="font-semibold underline">
              Volver
            </Link>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input label="Nuevo usuario (correo) — opcional" type="email" placeholder={user?.email} {...campo('nuevoEmail')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nueva contraseña" type="password" autoComplete="new-password" {...campo('nuevaPassword')} />
            <Input label="Confirmar nueva contraseña" type="password" autoComplete="new-password" {...campo('confirmacion')} />
          </div>
          <p className="text-[11px] text-texto-suave -mt-2">Mínimo 8 caracteres.</p>

          <div className="pt-3 border-t border-borde">
            <Input label="Contraseña actual *" type="password" autoComplete="current-password" {...campo('passwordActual')} />
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="submit" cargando={guardando} textoCargando="Guardando...">
              Guardar cambios
            </Button>
            <Link
              to={rutaInicio(user)}
              className="px-5 py-2.5 border border-guinda text-guinda hover:bg-guinda/5 font-semibold text-sm rounded-lg"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
