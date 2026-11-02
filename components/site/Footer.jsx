import Link from "next/link";
import { site } from "@/config/site";
import { categories, subcategories } from "@/config/catalog";
import { Logo } from "./Logo";
import { Doodle } from "./Doodles";
import { InstagramIcon, WhatsAppIcon } from "./icons";

export function Footer() {
  const year = new Date().getFullYear();
  const actividades = subcategories.filter((item) => item.category === "actividades");

  return (
    <footer className="relative mt-24 overflow-hidden border-t-2 border-linea bg-papel">
      {/* Franja con los 5 colores del logo */}
      <div className="flex h-2" aria-hidden="true">
        <span className="flex-1 bg-purple" />
        <span className="flex-1 bg-pink" />
        <span className="flex-1 bg-green" />
        <span className="flex-1 bg-yellow" />
        <span className="flex-1 bg-teal" />
      </div>

      <Doodle shape="flower" color="pink" className="absolute -right-6 top-10 hidden h-28 w-28 rotate-12 opacity-90 lg:block" />

      <div className="container-site relative grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <Logo className="h-auto w-[170px]" />
          <p className="mt-5 max-w-[19rem] text-[15px] leading-relaxed text-gris">
            Recursos terapéuticos listos para imprimir, creados por Azu y Jaz, Licenciadas en Terapia Ocupacional.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp min-h-[42px] px-4 text-[14px]">
              <WhatsAppIcon className="h-4 w-4" />
              {site.contact.whatsappLabel}
            </a>
            {site.contact.instagram.url ? (
              <a href={site.contact.instagram.url} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-[42px] px-4 text-[14px]">
                <InstagramIcon className="h-4 w-4" />
                {site.contact.instagram.handle}
              </a>
            ) : null}
          </div>
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
                <Link href={`/recursos?tema=${item.slug}`} className="link-underline">
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
                  <Link href={`/recursos?tema=${item.slug}`} className="link-underline">
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      <div className="container-site flex flex-col gap-2 border-t-2 border-linea py-6 text-[13px] text-gris sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} ADAPTO · Recursos digitales</p>
        <p>Los recursos son de uso personal o profesional. No se permite su reventa ni distribución.</p>
      </div>
    </footer>
  );
}
