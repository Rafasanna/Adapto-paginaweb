import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

// Botón fijo de WhatsApp (abajo a la derecha) con el mensaje de config/site.js.
// Mismos colores que el resto de los botones: relleno y contorno de la "T" y la "O" del logo.
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl(site.contact.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[45] flex h-14 items-center gap-2 rounded-full border-2 border-teal-dark bg-teal pl-[13px] pr-[13px] text-tinta shadow-[0_8px_24px_-8px_rgb(0_0_0/0.35)] transition-[transform,padding,background-color] duration-300 hover:-translate-y-0.5 hover:bg-teal-dark sm:bottom-6 sm:right-6 sm:hover:pr-5"
    >
      <WhatsAppIcon className="h-[26px] w-[26px] shrink-0" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-[15px] font-semibold opacity-0 transition-[max-width,opacity] duration-300 group-hover:max-w-[120px] group-hover:opacity-100 sm:inline">
        Escribinos
      </span>
    </a>
  );
}
