import { MessageCircle, Printer, ShoppingBag } from "lucide-react";
import { colorClass } from "@/lib/colors";
import { cn } from "@/lib/utils";

// Íconos de "Cómo comprar": de línea fina, en el tono oscuro de cada color.
const icons = {
  carrito: ShoppingBag,
  chat: MessageCircle,
  imprimir: Printer
};

export function StepIcon({ name, color = "teal", className }) {
  const Icon = icons[name] || ShoppingBag;
  return (
    <span className={cn("inline-grid place-items-center", colorClass(color).text, className)} aria-hidden="true">
      <Icon className="h-[62%] w-[62%]" strokeWidth={1.6} />
    </span>
  );
}
