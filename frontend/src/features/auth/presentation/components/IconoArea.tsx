import {
  Landmark,
  SearchCheck,
  Coins,
  ScrollText,
  Siren,
  Drama,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Trees,
  Sparkles,
  Wrench,
  HardHat,
  Trophy,
  Baby,
  Fuel,
  Handshake,
  Scale,
  ClipboardList,
  Users,
  TrendingUp,
  Building2,
  type LucideIcon,
} from 'lucide-react';

/** Icono SVG de cada dirección (por siglas del catálogo oficial). */
const ICONOS: Record<string, LucideIcon> = {
  PM: Landmark,
  CM: SearchCheck,
  TM: Coins,
  SA: ScrollText,
  PC: Siren,
  CT: Drama,
  EDU: GraduationCap,
  IMM: HeartHandshake,
  PDSP: ShieldCheck,
  EMA: Trees,
  DMJ: Sparkles,
  SP: Wrench,
  OPDU: HardHat,
  DEP: Trophy,
  SIPINNA: Baby,
  ESP: Fuel,
  PS: Handshake,
  DH: Scale,
  SPART: ClipboardList,
  DIF: Users,
  DE: TrendingUp,
};

/** Recuadro con el icono de la dirección; `activo` lo pinta en guinda sólido. */
export const IconoArea = ({ siglas, activo = false }: { siglas: string; activo?: boolean }) => {
  const Icono = ICONOS[siglas] || Building2;
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition ${
        activo ? 'bg-guinda text-white' : 'bg-[#f6ecef] text-guinda group-hover:bg-guinda group-hover:text-white'
      }`}
    >
      <Icono size={19} strokeWidth={1.9} />
    </span>
  );
};
