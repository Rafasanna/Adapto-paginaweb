import { getColor } from "@/lib/colors";

// Íconos de "Cómo comprar": reinterpretan los íconos del PDF (carrito, chat, idea)
// con el estilo del logo.
const INK = "#2E2A27";

const icons = {
  carrito: (c) => (
    <>
      <path d="M6 12h7l6 30h28l5-20H17" fill="none" stroke={c.dark} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 22H52l-5 20H19.5z" fill={c.fill} stroke={c.dark} strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="27" y="13" width="9" height="12" rx="2" fill="#FFF7EC" stroke={c.dark} strokeWidth="3" transform="rotate(-10 31 19)" />
      <circle cx="23" cy="52" r="4.5" fill="#FFF7EC" stroke={c.dark} strokeWidth="3.5" />
      <circle cx="43" cy="52" r="4.5" fill="#FFF7EC" stroke={c.dark} strokeWidth="3.5" />
    </>
  ),
  chat: (c) => (
    <>
      <path d="M36 22c10 0 20 6 20 15 0 4-2 8-6 11l3 7-9-4c-3 1-5 1-8 1-10 0-18-6-18-15s8-15 18-15z" fill="#FFF7EC" stroke={c.dark} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M28 8C16 8 6 15 6 25c0 5 3 10 7 13l-3 8 10-5c3 1 5 1 8 1 12 0 22-7 22-17S40 8 28 8z" fill={c.fill} stroke={c.dark} strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="19" cy="25" r="2.8" fill={INK} />
      <circle cx="28" cy="25" r="2.8" fill={INK} />
      <circle cx="37" cy="25" r="2.8" fill={INK} />
    </>
  ),
  imprimir: (c) => (
    <>
      <path d="M18 8h22l8 8v16H18z" fill="#FFF7EC" stroke={c.dark} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M24 18h12M24 24h16" stroke={c.dark} strokeWidth="3" strokeLinecap="round" />
      <rect x="8" y="28" width="48" height="22" rx="7" fill={c.fill} stroke={c.dark} strokeWidth="3.5" />
      <path d="M18 42h28v14H18z" fill="#FFF7EC" stroke={c.dark} strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="47" cy="36" r="2.6" fill={INK} />
      <path d="M50 4l1.5 4M57 9l-4 1.5" stroke="#E9BF1E" strokeWidth="3" strokeLinecap="round" />
    </>
  )
};

export function StepIcon({ name, color, className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {icons[name](getColor(color))}
    </svg>
  );
}
