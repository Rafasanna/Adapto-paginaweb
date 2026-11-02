import { getColor } from "@/lib/colors";

// Formas decorativas con el trazo del logo (relleno + borde del mismo tono).

const shapes = {
  star: (c) => (
    <path
      d="M32 6l7 16 17 2-13 11 4 17-15-9-15 9 4-17L8 24l17-2z"
      fill={c.fill}
      stroke={c.dark}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
  ),
  circle: (c) => <circle cx="32" cy="32" r="22" fill={c.fill} stroke={c.dark} strokeWidth="3.5" />,
  ring: (c) => <circle cx="32" cy="32" r="20" fill="none" stroke={c.fill} strokeWidth="10" />,
  squiggle: (c) => (
    <path d="M6 40c6-14 12-14 18 0s12 14 18 0 12-14 18 0" fill="none" stroke={c.fill} strokeWidth="7" strokeLinecap="round" />
  ),
  flower: (c) => (
    <>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="32"
          cy="17"
          rx="9"
          ry="12"
          transform={`rotate(${angle} 32 32)`}
          fill={c.fill}
          stroke={c.dark}
          strokeWidth="3"
        />
      ))}
      <circle cx="32" cy="32" r="8" fill="#FFDE59" stroke="#E9BF1E" strokeWidth="3" />
    </>
  ),
  pencil: (c) => (
    <>
      <path d="M44 6l14 14-30 30-16 4 4-16z" fill={c.fill} stroke={c.dark} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M16 38l10 10" stroke={c.dark} strokeWidth="3.5" />
      <path d="M16 38l-4 16 16-4" fill="#FFF7EC" stroke={c.dark} strokeWidth="3.5" strokeLinejoin="round" />
    </>
  ),
  heart: (c) => (
    <path
      d="M32 54L12 34C4 26 9 12 20 12c6 0 9 4 12 8 3-4 6-8 12-8 11 0 16 14 8 22z"
      fill={c.fill}
      stroke={c.dark}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
  ),
  puzzle: (c) => (
    <path
      d="M10 22h10a5 5 0 1110 0h10v10a5 5 0 110 10v10H30a5 5 0 10-10 0H10V42a5 5 0 100-10z"
      fill={c.fill}
      stroke={c.dark}
      strokeWidth="3.5"
      strokeLinejoin="round"
      transform="translate(4 -2)"
    />
  )
};

export function Doodle({ shape = "star", color = "yellow", className, style }) {
  const render = shapes[shape] || shapes.star;
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      {render(getColor(color))}
    </svg>
  );
}
