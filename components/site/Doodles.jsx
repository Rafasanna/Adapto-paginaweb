import { getColor } from "@/lib/colors";

// Trazos decorativos de línea (como hechos con fibra sobre la hoja).
// Sin stickers (corazones, estrellas, flores): solo líneas y puntos.

const line = (c, d, width = 6) => (
  <path d={d} fill="none" stroke={c.fill} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
);

const shapes = {
  squiggle: (c) => line(c, "M6 40c6-14 12-14 18 0s12 14 18 0 12-14 18 0", 7),
  wave: (c) => line(c, "M4 34c5-10 10-10 15 0s10 10 15 0 10-10 15 0 10 10 11 4", 5),
  curl: (c) => line(c, "M44 12c-14-6-30 4-26 18 3 10 18 10 20 1 2-8-10-11-14-4-5 9 2 22 12 27"),
  loop: (c) => line(c, "M4 46c8-28 30-34 28-14-1 14-16 12-12 2 4-10 18-12 26-8 6 3 10 0 14-6"),
  zigzag: (c) => line(c, "M6 40l10-14 10 14 10-14 10 14 10-14"),
  arc: (c) => line(c, "M8 46a26 26 0 0 1 48 0"),
  ring: (c) => <circle cx="32" cy="32" r="18" fill="none" stroke={c.fill} strokeWidth="6" />,
  dot: (c) => <circle cx="32" cy="32" r="9" fill={c.fill} />
};

export function Doodle({ shape = "squiggle", color = "green", className, style }) {
  const render = shapes[shape] || shapes.squiggle;
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      {render(getColor(color))}
    </svg>
  );
}
