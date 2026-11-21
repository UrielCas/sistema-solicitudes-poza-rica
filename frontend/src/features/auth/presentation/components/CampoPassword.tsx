import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const claseInputLogin =
  'w-full h-12 px-4 border border-[#e6dcd5] rounded-xl text-[15px] bg-[#fbf8f6] placeholder:text-[#9a8f8a] focus:outline-none focus:bg-white focus:ring-2 focus:ring-guinda/25 focus:border-guinda transition';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

/** Campo de contraseña con botón para mostrar/ocultar. */
export const CampoPassword = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, placeholder = 'Contraseña', autoComplete = 'current-password' }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${claseInputLogin} pr-12`}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#8a7f7a] hover:text-guinda cursor-pointer"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);
CampoPassword.displayName = 'CampoPassword';
