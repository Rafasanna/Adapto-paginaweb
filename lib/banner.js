// Barra de anuncio y fondo del inicio: valores compartidos entre la tienda y el admin.

// Colores sugeridos para la barra: los del logo + tinta (casi negro).
export const ANNOUNCEMENT_COLORS = [
  { name: "Tinta", value: "#2E2A27" },
  { name: "Violeta", value: "#CB6CE6" },
  { name: "Rosa", value: "#FF66C4" },
  { name: "Verde", value: "#B1D782" },
  { name: "Amarillo", value: "#FFDE59" },
  { name: "Turquesa", value: "#9AD7C4" }
];

export const ANNOUNCEMENT_MAX = 140;

// Velo blanco sobre la foto del inicio, para que el logo y el texto se lean bien.
export const HERO_VEILS = [
  { id: "suave", label: "Suave", className: "bg-white/45" },
  { id: "medio", label: "Medio", className: "bg-white/65" },
  { id: "fuerte", label: "Fuerte", className: "bg-white/80" }
];

export function veilClass(id) {
  return (HERO_VEILS.find((veil) => veil.id === id) || HERO_VEILS[1]).className;
}

export function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

// Elige el color de letra que mejor se lee sobre el fondo: tinta o blanco tiza.
const DARK_TEXT = "#2E2A27";
const LIGHT_TEXT = "#FDFEF9";

export function textColorFor(background) {
  if (!isHexColor(background)) return LIGHT_TEXT;
  const bg = luminance(background);
  const contrastDark = (bg + 0.05) / (luminance(DARK_TEXT) + 0.05);
  const contrastLight = (luminance(LIGHT_TEXT) + 0.05) / (bg + 0.05);
  return contrastDark >= contrastLight ? DARK_TEXT : LIGHT_TEXT;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
