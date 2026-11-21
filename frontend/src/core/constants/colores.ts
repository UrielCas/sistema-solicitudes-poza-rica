/**
 * Paleta institucional. Los mismos valores están como tokens de Tailwind en
 * core/theme/theme.css (bg-guinda, text-dorado, …); aquí se usan cuando hace falta
 * el valor en JavaScript (mapas, gráficas, estilos en línea).
 */
export const COLORES = {
  guinda: '#731936',
  guindaOscuro: '#4b1027',
  guindaClaro: '#f2e7ed',
  dorado: '#b8925a',
  crema: '#f3e9df',
  texto: '#292b34',
  textoSuave: '#707784',
  borde: '#e3e5e9',
  fondo: '#f4f5f7',
} as const;
