// Los 5 colores del logo, para usar dentro de SVG (mismos valores que tailwind.config.js).
export const colors = {
  purple: { fill: "#CB6CE6", dark: "#844796", soft: "#F6E9FB" },
  pink: { fill: "#FF66C4", dark: "#F73AAF", soft: "#FFE8F5" },
  green: { fill: "#B1D782", dark: "#94A972", soft: "#EEF6E4" },
  yellow: { fill: "#FFDE59", dark: "#E9BF1E", soft: "#FFF7D4" },
  teal: { fill: "#9AD7C4", dark: "#81BFAC", soft: "#E6F5F0" }
};

export const colorNames = Object.keys(colors);

export function getColor(name) {
  return colors[name] || colors.purple;
}

// Clases de Tailwind por color (escritas completas para que Tailwind las detecte).
export const colorClasses = {
  purple: { bg: "bg-purple", soft: "bg-purple-soft", border: "border-purple-dark", text: "text-purple-ink", ring: "ring-purple" },
  pink: { bg: "bg-pink", soft: "bg-pink-soft", border: "border-pink-dark", text: "text-pink-ink", ring: "ring-pink" },
  green: { bg: "bg-green", soft: "bg-green-soft", border: "border-green-dark", text: "text-green-ink", ring: "ring-green" },
  yellow: { bg: "bg-yellow", soft: "bg-yellow-soft", border: "border-yellow-dark", text: "text-yellow-ink", ring: "ring-yellow" },
  teal: { bg: "bg-teal", soft: "bg-teal-soft", border: "border-teal-dark", text: "text-teal-ink", ring: "ring-teal" }
};

export function colorClass(name) {
  return colorClasses[name] || colorClasses.purple;
}
