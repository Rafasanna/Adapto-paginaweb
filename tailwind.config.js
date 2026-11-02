/** @type {import('tailwindcss').Config} */

// Paleta tomada del logo de ADAPTO (PDF de marca).
// Cada color tiene: DEFAULT (relleno de la letra), dark (el borde de la letra),
// soft (fondo suave) e ink (texto legible sobre ese color).
const palette = {
  purple: { DEFAULT: "#CB6CE6", dark: "#844796", soft: "#F6E9FB", ink: "#5E2E6E" },
  pink: { DEFAULT: "#FF66C4", dark: "#F73AAF", soft: "#FFE8F5", ink: "#9C1C6A" },
  green: { DEFAULT: "#B1D782", dark: "#94A972", soft: "#EEF6E4", ink: "#4D6330" },
  yellow: { DEFAULT: "#FFDE59", dark: "#E9BF1E", soft: "#FFF7D4", ink: "#7A5B00" },
  teal: { DEFAULT: "#9AD7C4", dark: "#81BFAC", soft: "#E6F5F0", ink: "#2F6B5A" }
};

module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}", "./config/**/*.js"],
  safelist: [
    // Colores que llegan desde la base / config (no aparecen literales en el código)
    { pattern: /(bg|text|border|ring|fill|stroke)-(purple|pink|green|yellow|teal)(-(dark|soft|ink))?/ }
  ],
  theme: {
    extend: {
      colors: {
        ...palette,
        crema: "#F8F3EA", // fondo del PDF de marca
        papel: "#FFFDF9",
        tinta: "#2E2A27",
        gris: "#737373", // gris de "Recursos digitales"
        linea: "#E8E0D2"
      },
      fontFamily: {
        sans: ['"Outfit Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Outfit Variable"', "ui-sans-serif", "system-ui", "sans-serif"]
      },
      maxWidth: {
        site: "78rem"
      },
      boxShadow: {
        paper: "0 1px 2px rgb(46 42 39 / 0.06), 0 8px 24px -12px rgb(46 42 39 / 0.25)",
        lift: "0 2px 0 rgb(46 42 39 / 0.9)"
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--r, 0deg))" },
          "50%": { transform: "translateY(-10px) rotate(var(--r, 0deg))" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" }
        },
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        sheetUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" }
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        toastIn: {
          "0%": { opacity: "0", transform: "translate(-50%, 12px)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" }
        }
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.3s ease both",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
        pop: "pop 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in": "slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-up": "sheetUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-left": "slideInLeft 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "toast-in": "toastIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both"
      }
    }
  },
  plugins: []
};
