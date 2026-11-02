import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

// Botón fijo de WhatsApp (abajo a la derecha) con el mensaje de config/site.js.
// Usa el verde oficial de WhatsApp para que se reconozca de inmediato.
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl(site.contact.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[45] flex h-14 items-center gap-2 rounded-full bg-[#25D366] pl-[15px] pr-[15px] text-white shadow-[0_8px_24px_-6px_rgb(0_0_0/0.35)] transition-[transform,padding] duration-300 hover:-translate-y-0.5 sm:bottom-6 sm:right-6 sm:hover:pr-5"
    >
      <WhatsAppIcon className="h-[26px] w-[26px] shrink-0" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-[15px] font-semibold opacity-0 transition-[max-width,opacity] duration-300 group-hover:max-w-[120px] group-hover:opacity-100 sm:inline">
        Escribinos
      </span>
    </a>
  );
}
