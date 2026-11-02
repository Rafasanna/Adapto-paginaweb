import { getColor } from "@/lib/colors";

// Íconos propios de cada tema. Mismo lenguaje que el logo:
// formas con relleno pastel y contorno grueso del mismo tono, más oscuro.
// Los detalles (ojitos, líneas) van en tinta para que se lean bien.

const INK = "#2E2A27";

const icons = {
  // Lápiz escribiendo una línea ondulada
  escritura: (c) => (
    <>
      <path d="M8 52c6-6 10 2 16-3s8 3 14-1" fill="none" stroke={c.dark} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6" />
      <path d="M40 10l12 12-22 22-14 3 3-14z" fill={c.fill} stroke={c.dark} strokeWidth="3" strokeLinejoin="round" />
      <path d="M40 10l5-5a3 3 0 014 0l8 8a3 3 0 010 4l-5 5" fill="#FFDE59" stroke="#E9BF1E" strokeWidth="3" strokeLinejoin="round" />
      <path d="M19 33l12 12" stroke={c.dark} strokeWidth="3" />
      <path d="M19 33l-3 14 14-3" fill="#FFF7EC" stroke={c.dark} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="17.5" cy="45.5" r="2.2" fill={INK} />
    </>
  ),
  // Mano haciendo pinza con una cuenta
  motricidad: (c) => (
    <>
      <path
        d="M18 50V30a4 4 0 018 0v-6a4 4 0 018 0v-2a4 4 0 018 0v8l4-4a4 4 0 016 5l-9 13c-3 5-7 8-13 8h-4c-5 0-8-3-8-8z"
        fill={c.fill}
        stroke={c.dark}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M26 30v10M34 24v14M42 22v14" stroke={c.dark} strokeWidth="3" strokeLinecap="round" />
      <circle cx="49" cy="14" r="6" fill="#FFDE59" stroke="#E9BF1E" strokeWidth="3" />
      <path d="M49 20v6" stroke="#E9BF1E" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  // Cuchara + cepillo de dientes + luna (alimentación, higiene, descanso)
  avd: (c) => (
    <>
      <ellipse cx="20" cy="20" rx="8" ry="10" fill={c.fill} stroke={c.dark} strokeWidth="3" />
      <path d="M20 30v24" stroke={c.dark} strokeWidth="4.5" strokeLinecap="round" />
      <rect x="31" y="12" width="9" height="42" rx="4.5" fill="#9AD7C4" stroke="#81BFAC" strokeWidth="3" />
      <path d="M35.5 12v-2M31 15h-3M31 20h-3M31 25h-3" stroke="#81BFAC" strokeWidth="3" strokeLinecap="round" />
      <path d="M56 40a9 9 0 11-8-12 7 7 0 008 12z" fill="#FFDE59" stroke="#E9BF1E" strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  // Billete y monedas
  dinero: (c) => (
    <>
      <rect x="6" y="16" width="40" height="24" rx="5" fill="#B1D782" stroke="#94A972" strokeWidth="3" transform="rotate(-8 26 28)" />
      <circle cx="26" cy="28" r="6" fill="#FFF7EC" stroke="#94A972" strokeWidth="3" />
      <ellipse cx="44" cy="48" rx="13" ry="5" fill={c.fill} stroke={c.dark} strokeWidth="3" />
      <path d="M31 48v-6c0-3 6-5 13-5s13 2 13 5v6" fill={c.fill} stroke={c.dark} strokeWidth="3" />
      <ellipse cx="44" cy="42" rx="13" ry="5" fill={c.fill} stroke={c.dark} strokeWidth="3" />
      <path d="M44 40v4" stroke={c.dark} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  // Carita con corazón
  emociones: (c) => (
    <>
      <circle cx="28" cy="34" r="20" fill={c.fill} stroke={c.dark} strokeWidth="3" />
      <circle cx="21" cy="31" r="2.6" fill={INK} />
      <circle cx="35" cy="31" r="2.6" fill={INK} />
      <path d="M20 40c4 5 12 5 16 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="38" r="3" fill="#FF66C4" opacity="0.55" />
      <circle cx="40" cy="38" r="3" fill="#FF66C4" opacity="0.55" />
      <path d="M50 22c-4-4-10 0-6 5l6 6 6-6c4-5-2-9-6-5z" fill="#FF66C4" stroke="#F73AAF" strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  // Pieza de rompecabezas + chispa
  cognitiva: (c) => (
    <>
      <path
        d="M10 22h10a5 5 0 1110 0h10v10a5 5 0 110 10v10H30a5 5 0 10-10 0H10V42a5 5 0 100-10z"
        fill={c.fill}
        stroke={c.dark}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M52 8v8M48 12h8" stroke="#E9BF1E" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M55 26v5M52.5 28.5h5" stroke="#F73AAF" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  // Reloj + check (rutinas)
  rutinas: (c) => (
    <>
      <circle cx="28" cy="32" r="20" fill={c.fill} stroke={c.dark} strokeWidth="3" />
      <circle cx="28" cy="32" r="14" fill="#FFF7EC" />
      <path d="M28 23v9l6 4" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="46" r="10" fill="#B1D782" stroke="#94A972" strokeWidth="3" />
      <path d="M43.5 46l3 3 5.5-6" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Portapapeles con gráfico que sube
  seguimiento: (c) => (
    <>
      <rect x="12" y="10" width="36" height="46" rx="6" fill={c.fill} stroke={c.dark} strokeWidth="3" />
      <rect x="22" y="6" width="16" height="9" rx="3" fill="#FFDE59" stroke="#E9BF1E" strokeWidth="3" />
      <rect x="18" y="20" width="24" height="28" rx="3" fill="#FFF7EC" />
      <path d="M22 42l6-7 5 4 6-9" fill="none" stroke="#844796" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="39" cy="30" r="2.6" fill="#844796" />
    </>
  )
};

export function TopicIcon({ name, color = "purple", className, title }) {
  const render = icons[name] || icons.cognitiva;
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      {render(getColor(color))}
    </svg>
  );
}
