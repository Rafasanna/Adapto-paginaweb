import { textColorFor } from "@/lib/banner";

// Barra de anuncio arriba del header (se activa y edita desde el admin).
// Queda en el flujo normal: al bajar, se va y el header sigue fijo arriba.
export function AnnouncementBar({ announcement }) {
  if (!announcement?.enabled || !announcement.text) return null;
  return (
    <div
      className="px-4 py-2 text-center text-[13px] font-medium leading-snug tracking-[0.01em] sm:text-[14px]"
      style={{ backgroundColor: announcement.color, color: textColorFor(announcement.color) }}
    >
      <p className="mx-auto max-w-[1100px]">{announcement.text}</p>
    </div>
  );
}
