import Link from "next/link";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { categories, subcategories } from "@/config/catalog";
import { Logo } from "./Logo";
import { InstagramIcon, WhatsAppIcon } from "./icons";

export function Footer() {
  const year = new Date().getFullYear();
  const actividades = subcategories.filter((item) => item.category === "actividades");

  return (
    <footer className="relative overflow-hidden bg-crema">
      {/* Franja con los 5 colores del logo */}
      <div className="flex h-2" aria-hidden="true">
        <span className="flex-1 bg-purple" />
        <span className="flex-1 bg-pink" />
        <span className="flex-1 bg-green" />
        <span className="flex-1 bg-yellow" />
        <span className="flex-1 bg-teal" />
      </div>


      <div className="container-site relative grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <Logo className="h-auto w-[170px]" />
          <p className="mt-5 max-w-[19rem] text-[15px] leading-relaxed text-gris">
            Recursos terapéuticos listos para imprimir, creados por Azu y Jaz, Licenciadas en Terapia Ocupacional.
          </p>
          <a
            href={whatsappUrl(site.contact.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp mt-5 min-h-[42px] px-4 text-[14px]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          {site.contact.instagrams.length ? (
            <ul className="mt-4 space-y-1.5" aria-label="Instagram">
              {site.contact.instagrams.map((item) => (
                <li key={item.handle}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-0.5 text-[15px] text-tinta/80 transition-colors hover:text-teal-ink"
                  >
                    <InstagramIcon className="h-[18px] w-[18px] text-teal-ink" />
                    <span className="link-underline">{item.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Pie de página" className="col-span-2 sm:col-span-1">
          <p className="eyebrow">El sitio</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#preguntas" className="link-underline">
                Preguntas frecuentes
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Actividades">
          <p className="eyebrow">{categories[0].name}</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            {actividades.map((item) => (
              <li key={item.slug}>
                <Link href={`/productos?tema=${item.slug}`} className="link-underline">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Guías">
          <p className="eyebrow">{categories[1].name}</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            {subcategories
              .filter((item) => item.category === "guias")
              .map((item) => (
                <li key={item.slug}>
                  <Link href={`/productos?tema=${item.slug}`} className="link-underline">
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      <div className="container-site flex flex-col gap-2 border-t-2 border-linea py-6 text-[13px] text-gris sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} ADAPTO · Recursos digitales</p>
        <p>Los productos son de uso personal o profesional. No se permite su reventa ni distribución.</p>
      </div>
    </footer>
  );
}
