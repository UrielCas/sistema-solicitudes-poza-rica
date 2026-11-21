import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'exito';
type Tamano = 'sm' | 'md';

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-guinda hover:bg-guinda-oscuro text-white shadow-sm',
  secundario: 'border border-guinda text-guinda bg-white hover:bg-guinda/5',
  fantasma: 'text-texto-suave hover:text-guinda hover:bg-guinda/5',
  peligro: 'border border-red-300 text-red-700 bg-white hover:bg-red-50',
  exito: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm',
};

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean;
  textoCargando?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variante = 'primario', tamano = 'md', cargando, textoCargando, className = '', children, disabled, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {cargando ? textoCargando || 'Procesando...' : children}
    </button>
  )
);
Button.displayName = 'Button';
