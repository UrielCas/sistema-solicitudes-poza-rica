import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, forwardRef, useId } from 'react';

export const claseControl =
  'w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-guinda/30 focus:border-guinda disabled:bg-slate-50';

interface Envoltura {
  label?: ReactNode;
  ayuda?: ReactNode;
  error?: string | null;
  className?: string;
}

/** Etiqueta + control + texto de ayuda/error con el mismo estilo en todo el sistema. */
const Campo = ({ id, label, ayuda, error, className = '', children }: Envoltura & { id: string; children: ReactNode }) => (
  <div className={className}>
    {label && (
      <label htmlFor={id} className="block text-xs font-semibold mb-1">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-[11px] text-red-700 mt-1">{error}</p>
    ) : (
      ayuda && <p className="text-[11px] text-texto-suave mt-1">{ayuda}</p>
    )}
  </div>
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Envoltura>(
  ({ label, ayuda, error, className, id, ...props }, ref) => {
    const auto = useId();
    const idControl = id || auto;
    return (
      <Campo id={idControl} label={label} ayuda={ayuda} error={error} className={className}>
        <input ref={ref} id={idControl} aria-invalid={!!error} className={claseControl} {...props} />
      </Campo>
    );
  }
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & Envoltura>(
  ({ label, ayuda, error, className, id, children, ...props }, ref) => {
    const auto = useId();
    const idControl = id || auto;
    return (
      <Campo id={idControl} label={label} ayuda={ayuda} error={error} className={className}>
        <select ref={ref} id={idControl} aria-invalid={!!error} className={claseControl} {...props}>
          {children}
        </select>
      </Campo>
    );
  }
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & Envoltura>(
  ({ label, ayuda, error, className, id, ...props }, ref) => {
    const auto = useId();
    const idControl = id || auto;
    return (
      <Campo id={idControl} label={label} ayuda={ayuda} error={error} className={className}>
        <textarea ref={ref} id={idControl} aria-invalid={!!error} className={claseControl} {...props} />
      </Campo>
    );
  }
);
Textarea.displayName = 'Textarea';
