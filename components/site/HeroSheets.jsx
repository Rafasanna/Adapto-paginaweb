// Ilustración del inicio: dos hojas de actividades apoyadas sobre la hoja cuadriculada.
// En tonos del verde agua de la "T" y la "O" y grises, para no recargar de color.
// Izquierda: ficha de trazos punteados. Derecha: hoja de cuaderno con espiral y una rutina tildada.

const INK = "#2E2A27";

export function TraceSheet({ className }) {
  return (
    <svg viewBox="0 0 240 320" className={className} aria-hidden="true">
      <rect x="4" y="6" width="232" height="308" rx="10" fill="#2E2A27" opacity="0.08" transform="translate(4 6)" />
      <rect x="4" y="4" width="232" height="308" rx="10" fill="#FFFFFF" stroke="#E8E0D2" strokeWidth="2" />
      <rect x="20" y="20" width="200" height="40" rx="10" fill="#E6F5F0" stroke="#81BFAC" strokeWidth="2" />
      <rect x="34" y="33" width="92" height="7" rx="3.5" fill="#2F6B5A" opacity="0.75" />
      <rect x="34" y="46" width="58" height="5" rx="2.5" fill="#2F6B5A" opacity="0.3" />
      {[0, 1, 2, 3].map((row) => {
        const y = 100 + row * 52;
        const color = ["#81BFAC", "#9AD7C4", "#81BFAC", "#9AD7C4"][row];
        const paths = [
          `M36 ${y} q12 -22 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t20 0`,
          `M36 ${y} l14 -18 l14 18 l14 -18 l14 18 l14 -18 l14 18 l14 -18 l14 18 l14 -18 l14 18 l14 -18`,
          `M36 ${y} c6 -26 22 -26 16 0 c6 -26 22 -26 16 0 c6 -26 22 -26 16 0 c6 -26 22 -26 16 0 c6 -26 22 -26 16 0 c6 -26 22 -26 16 0 c6 -26 22 -26 16 0 c6 -26 22 -26 16 0 c6 -26 22 -26 16 0`,
          `M36 ${y} q12 -22 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t20 0`
        ][row];
        return (
          <g key={row}>
            <circle cx="30" cy={y} r="4" fill={color} />
            <path d={paths} fill="none" stroke={color} strokeWidth="3.5" strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      <rect x="84" y="290" width="72" height="5" rx="2.5" fill={INK} opacity="0.12" />
    </svg>
  );
}

export function NotebookSheet({ className }) {
  const tasks = [
    { color: "#9AD7C4", dark: "#81BFAC", done: true },
    { color: "#9AD7C4", dark: "#81BFAC", done: true },
    { color: "#9AD7C4", dark: "#81BFAC", done: true },
    { color: "#E8E0D2", dark: "#D8CFBF", done: false },
    { color: "#E8E0D2", dark: "#D8CFBF", done: false }
  ];
  return (
    <svg viewBox="0 0 250 320" className={className} aria-hidden="true">
      <defs>
        <pattern id="cuadricula-hoja" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M14 0H0V14" fill="none" stroke="#9FB4CC" strokeOpacity="0.35" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="18" y="10" width="226" height="306" rx="10" fill="#2E2A27" opacity="0.08" />
      <rect x="14" y="4" width="226" height="306" rx="10" fill="#FFFFFF" />
      <rect x="14" y="4" width="226" height="306" rx="10" fill="url(#cuadricula-hoja)" stroke="#E8E0D2" strokeWidth="2" />
      {/* espiral */}
      {Array.from({ length: 11 }, (_, index) => {
        const y = 22 + index * 27;
        const color = "#B9B2A6";
        return (
          <g key={index}>
            <circle cx="26" cy={y + 4} r="4" fill="#E8E0D2" />
            <path d={`M26 ${y + 4} C 4 ${y + 4}, 2 ${y - 8}, 16 ${y - 8}`} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
          </g>
        );
      })}
      {/* sol + título */}
      <circle cx="62" cy="40" r="13" fill="#E6F5F0" stroke="#81BFAC" strokeWidth="2.5" />
      <rect x="84" y="32" width="96" height="8" rx="4" fill={INK} opacity="0.75" />
      <rect x="84" y="46" width="60" height="5" rx="2.5" fill={INK} opacity="0.25" />
      {tasks.map((task, index) => {
        const y = 80 + index * 44;
        return (
          <g key={index}>
            <rect x="48" y={y} width="122" height="30" rx="9" fill={task.color} fillOpacity="0.35" stroke={task.dark} strokeWidth="2" />
            <rect x="60" y={y + 12} width={56 + ((index * 17) % 30)} height="6" rx="3" fill={INK} opacity="0.55" />
            <rect x="182" y={y + 3} width="24" height="24" rx="7" fill="#FFFFFF" stroke={INK} strokeOpacity="0.35" strokeWidth="2" />
            {task.done ? (
              <path d={`M187 ${y + 15} l5 5 l10 -11`} fill="none" stroke="#2F7A66" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
