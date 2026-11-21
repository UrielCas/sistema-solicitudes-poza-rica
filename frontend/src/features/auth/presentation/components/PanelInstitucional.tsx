import { TEXTOS } from '../../../../core/constants/strings';

export const Flor = ({ className }: { className: string }) => (
  <img
    src="/img/flor-institucional.png"
    alt=""
    aria-hidden="true"
    className={`absolute pointer-events-none select-none ${className}`}
  />
);

/** Panel guinda izquierdo del login: escudo, logotipo, "Presidencia Municipal" y lema. */
export const PanelInstitucional = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-[#7d1d3d] via-[#731936] to-[#5e1229] text-white flex flex-col items-center justify-center px-6 py-10 md:py-0 text-center">
    <Flor className="w-72 -top-16 -left-20 opacity-60 brightness-[0.6]" />
    <Flor className="w-56 top-1/3 -right-24 opacity-50 brightness-[0.6] hidden md:block" />
    <Flor className="w-80 -bottom-24 -left-16 opacity-55 brightness-[0.6] hidden md:block" />

    <div className="relative flex flex-col items-center gap-6 w-full">
      {/* Escudo (recortado del logo a color) + logotipo en blanco */}
      <div className="flex items-center justify-center gap-1 w-full max-w-[340px] h-[60px] lg:h-[74px]">
        <div className="shrink-0 h-full aspect-[51/64] overflow-hidden">
          <img src="/img/logo-poza-rica-color.png" alt="" aria-hidden="true" className="h-full w-auto max-w-none" />
        </div>
        <img
          src="/img/logo-poza-rica-blanco.png"
          alt="Gobierno de Poza Rica · H. Ayuntamiento 2026-2029"
          className="h-full w-auto min-w-0 object-contain object-left"
        />
      </div>

      <div>
        <h1 className="font-display text-[28px] md:text-[clamp(22px,1.9vw,31px)] md:whitespace-nowrap font-extrabold leading-tight drop-shadow-sm">
          {TEXTOS.presidencia}
        </h1>
        <p className="mt-2 text-sm text-white/85">{TEXTOS.ayuntamiento}</p>
      </div>

      <img src="/img/lema-esperanza.png" alt="La esperanza hecha gobierno" className="w-40 md:w-44 mt-2 opacity-95 hidden md:block" />
    </div>
  </section>
);
