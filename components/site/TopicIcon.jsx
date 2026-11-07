import { Brain, CalendarCheck, ClipboardCheck, Hand, HeartHandshake, PenLine, Utensils, Wallet } from "lucide-react";
import { colorClass } from "@/lib/colors";
import { cn } from "@/lib/utils";

// Íconos de cada tema: de línea fina, sobrios, que sirven tanto para niños como para adultos.
// El color es el tono oscuro ("ink") del color de cada tema.
const icons = {
  escritura: PenLine,
  motricidad: Hand,
  avd: Utensils, // alimentación, higiene, descanso
  dinero: Wallet,
  emociones: HeartHandshake,
  cognitiva: Brain,
  rutinas: CalendarCheck,
  seguimiento: ClipboardCheck
};

export function TopicIcon({ name, color = "teal", className, title }) {
  const Icon = icons[name] || Brain;
  return (
    <span className={cn("inline-grid shrink-0 place-items-center", colorClass(color).text, className)} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <Icon className="h-[68%] w-[68%]" strokeWidth={1.75} />
    </span>
  );
}
