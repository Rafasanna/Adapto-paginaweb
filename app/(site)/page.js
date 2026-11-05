import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList, House, Plus } from "lucide-react";
import { site } from "@/config/site";
import { getCatalog } from "@/lib/server/catalog";
import { getSiteContent } from "@/lib/server/settings";
import { colorClass } from "@/lib/colors";
import { pluralize } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { NotebookSheet, TraceSheet } from "@/components/site/HeroSheets";
import { Reveal } from "@/components/site/Reveal";
import { StepIcon } from "@/components/site/StepIcon";
import { TopicIcon } from "@/components/site/TopicIcon";
import { WhatsAppIcon } from "@/components/site/icons";
import { ProductCard } from "@/components/shop/ProductCard";

export const revalidate = 300;

const steps = [
  {
    icon: "carrito",
    color: "pink",
    title: "Elegí tus productos",
    text: "Filtrá por tema o por edad y sumá al carrito la cantidad que necesites."
  },
  {
    icon: "chat",
    color: "purple",
    title: "Envianos el pedido",
    text: "Se abre WhatsApp con el detalle y el total. Te respondemos con los datos de pago."
  },
  {
    icon: "imprimir",
    color: "green",
    title: "Recibí e imprimí",
    text: "Te mandamos los archivos en PDF, listos para imprimir y usar."
  }
];

const faqs = [
  {
    q: "¿Cómo recibo los productos?",
    a: "Una vez confirmado el pago, te enviamos los archivos en PDF por WhatsApp (o por mail, si preferís). No hay envíos físicos: todo es digital."
  },
  {
    q: "¿Cómo pago?",
    a: "Cuando nos envíes por WhatsApp el detalle de tu compra, con el total calculado automáticamente desde el carrito, te compartiremos los datos para realizar el pago."
  },
  {
    q: "¿Puedo imprimirlos más de una vez?",
    a: "Sí. Una vez que tenés el archivo, podés imprimirlo las veces que necesites para tu uso personal o profesional."
  },
  {
    q: "¿Para qué edades son?",
    a: "Hay productos para niños, adolescentes y adultos. En la tienda podés filtrar por edad y en cada producto indicamos para quién está pensado."
  },
  {
    q: "¿Puedo compartir o revender el material?",
    a: "No. Los productos son de uso personal o profesional. Si querés compartirlos con colegas, recomendales ADAPTO."
  }
];

const marquee = ["Escritura", "Motricidad fina", "Rutinas", "Emociones", "Vida diaria", "Manejo del dinero", "Estimulación cognitiva", "Seguimiento"];

export default async function HomePage() {
  const [{ subcategories, products }, content] = await Promise.all([getCatalog(), getSiteContent()]);
  const subBySlug = new Map(subcategories.map((item) => [item.slug, item]));
  const countByTopic = new Map();
  for (const product of products) countByTopic.set(product.subcategory, (countByTopic.get(product.subcategory) || 0) + 1);

  const featured = [...products]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 4);

  return (
    <>
      {/* Bienvenida: logo y, debajo, la descripción */}
      <section className="bg-grid relative overflow-hidden">
        {/* Hojas de actividades apoyadas sobre la hoja cuadriculada */}
        <TraceSheet className="absolute -left-3 top-24 hidden w-[230px] -rotate-[9deg] drop-shadow-sm xl:block 2xl:left-[4%]" />
        <NotebookSheet className="absolute -right-3 top-[38%] hidden w-[240px] rotate-[7deg] drop-shadow-sm xl:block 2xl:right-[4%]" />


        <div className="container-site relative flex flex-col items-center pb-16 pt-14 text-center sm:pb-20 sm:pt-16">
          <h1 className="w-full max-w-[560px] animate-fade-in-up">
            <Logo priority className="h-auto w-full" alt="ADAPTO · Recursos digitales" />
          </h1>

          {/* Debajo del logo: primero la bienvenida y después quiénes somos */}
          <div className="mt-9 max-w-[620px] animate-fade-in-up [animation-delay:120ms]">
            <p className="text-[21px] font-semibold leading-snug sm:text-[25px]">{content.welcome}</p>
            <p className="mt-4 text-[17px] leading-relaxed text-teal-ink sm:text-[19px]">{content.who}</p>
          </div>

          <div className="mt-8 flex animate-fade-in-up flex-wrap justify-center gap-3 [animation-delay:220ms]">
            <Link href="/productos" className="btn-primary px-6 text-[16px]">
              Ver productos
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/nosotras" className="btn-outline px-6 text-[16px]">
              Conocenos
            </Link>
          </div>
        </div>
      </section>

      {/* Banner en movimiento con los temas */}
      <div className="relative overflow-hidden bg-tinta py-3.5" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-3">
          {[...marquee, ...marquee, ...marquee, ...marquee].map((label, index) => {
            return (
              <span key={`${label}-${index}`} className="flex items-center gap-3">
                <span className="whitespace-nowrap px-2 text-[15px] font-medium text-crema/90">{label}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
            );
          })}
        </div>
      </div>

      {/* Temas */}
      <section className="container-site py-20 sm:py-24" aria-labelledby="temas">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Explorá por tema</p>
            <h2 id="temas" className="title mt-2 text-[34px] sm:text-[44px]">
              ¿Qué querés trabajar hoy?
            </h2>
          </div>
          <Link href="/productos" className="inline-flex items-center gap-1.5 text-[15px] font-semibold underline underline-offset-4">
            Ver todos los productos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {subcategories.map((topic, index) => {
            const color = colorClass(topic.color);
            const count = countByTopic.get(topic.slug) || 0;
            return (
              <Reveal as="li" key={topic.slug} delay={index * 40} className="flex">
                <Link
                  href={`/productos?tema=${topic.slug}`}
                  className="group flex w-full flex-col rounded-[24px] border-2 border-linea bg-white p-4 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-teal hover:shadow-[0_10px_24px_-16px_rgb(47_122_102/0.45)] sm:p-5"
                >
                  <span className={cn("grid h-14 w-14 place-items-center rounded-2xl sm:h-16 sm:w-16", color.soft)}>
                    <TopicIcon name={topic.icon} color={topic.color} className="h-10 w-10 transition-transform duration-300 group-hover:scale-110 sm:h-11 sm:w-11" />
                  </span>
                  <span className="mt-4 text-[16.5px] font-semibold leading-tight text-tinta sm:text-[18px]">{topic.longName || topic.name}</span>
                  {topic.detail ? <span className="mt-1 text-[13px] leading-snug text-tinta/65">{topic.detail}</span> : null}
                  <span className="mt-auto flex items-center justify-between pt-4 text-[13px] font-semibold text-teal-ink">
                    {count ? pluralize(count, "producto", "productos") : "Muy pronto"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* Productos */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="destacados">
        <div className="container-site">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">La tienda</p>
            <h2 id="destacados" className="title mt-2 text-[34px] sm:text-[44px]">
              Productos destacados
            </h2>
          </div>
          <Link href="/productos" className="inline-flex items-center gap-1.5 text-[15px] font-semibold underline underline-offset-4">
            Ver la tienda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        {featured.length ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {featured.map((product, index) => (
              <li key={product.id} className="flex">
                <ProductCard product={product} subcategory={subBySlug.get(product.subcategory)} index={index} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[28px] border-2 border-dashed border-linea bg-crema px-6 py-14 text-center">
            <p className="title text-[22px]">Estamos preparando los primeros productos</p>
            <p className="mt-2 text-gris">Muy pronto vas a encontrarlos acá.</p>
          </div>
        )}
        </div>
      </section>

      {/* Cómo comprar */}
      <section id="como-comprar" className="scroll-mt-20 py-20 sm:py-24" aria-labelledby="como-comprar-titulo">
        <div className="container-site">
          <div className="rounded-[32px] bg-white px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
            <Reveal className="mx-auto max-w-xl text-center">
              <p className="eyebrow">Fácil y rápido</p>
              <h2 id="como-comprar-titulo" className="title mt-2 text-[34px] sm:text-[44px]">
                ¿Cómo comprar?
              </h2>
            </Reveal>

            <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              <span className="absolute left-[16%] right-[16%] top-11 hidden border-t-[3px] border-dashed border-linea md:block" aria-hidden="true" />
              {steps.map((step, index) => {
                return (
                  <Reveal as="li" key={step.title} delay={index * 90} className="group relative flex flex-col items-center text-center">
                    {/* Hover / toque: el círculo se marca y el ícono saluda como el logo */}
                    <span className="relative grid h-[88px] w-[88px] place-items-center rounded-full border-2 border-linea bg-white transition-colors duration-300 group-hover:border-teal group-active:border-teal">
                      <StepIcon name={step.icon} color={step.color} className="h-14 w-14 group-hover:animate-logo-hello group-active:animate-logo-hello" />
                      <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-teal-deep text-[14px] font-bold text-white">
                        {index + 1}
                      </span>
                    </span>
                    <h3 className="mt-5 text-[20px] font-semibold">{step.title}</h3>
                    <p className="mt-2 max-w-[18rem] text-[15.5px] leading-relaxed text-tinta/70">{step.text}</p>
                  </Reveal>
                );
              })}
            </ol>

            <div className="mt-12 flex justify-center">
              <Link href="/productos" className="btn-primary px-6">
                Empezar a elegir
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Para quién */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="para-quien">
        <div className="container-site">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Para quién</p>
          <h2 id="para-quien" className="title mt-2 text-[34px] sm:text-[44px]">
            Pensado para acompañar cada etapa
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal className="rounded-[28px] bg-crema p-6 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-soft text-teal-ink">
              <ClipboardList className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-[24px] font-semibold">Profesionales</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-tinta/75">
              Herramientas para enriquecer tus intervenciones con niños, adolescentes y adultos, listas para imprimir y llevar a la sesión.
            </p>
          </Reveal>
          <Reveal delay={90} className="rounded-[28px] bg-crema p-6 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-soft text-teal-ink">
              <House className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-[24px] font-semibold">Familias y acompañantes</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-tinta/75">
              Si sos mamá, papá, familiar o acompañante, también vas a encontrar propuestas simples para usar en casa.
            </p>
          </Reveal>
        </div>
        </div>
      </section>

      {/* Nosotras (adelanto) */}
      <section className="container-site py-20 sm:py-24" aria-labelledby="nosotras-home">
        <div className="grid items-center gap-10 rounded-[32px] bg-teal-soft px-6 py-10 sm:px-10 md:grid-cols-[auto_1fr] lg:gap-16 lg:px-14 lg:py-14">
          <Reveal className="flex justify-center">
            <div className="flex items-start -space-x-6">
              {content.team.map((person, index) => {
                return (
                  <div key={person.name} className={cn("relative rounded-full border-[3px] border-teal bg-white p-1", index === 1 && "mt-10")}>
                    <Image src={person.photo} alt={`${person.name}, ${person.role}`} width={170} height={170} className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40" />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-teal-deep px-3 py-0.5 text-[14px] font-semibold text-white">
                      {person.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </Reveal>
          <Reveal delay={90}>
            <p className="eyebrow">Nosotras</p>
            <h2 id="nosotras-home" className="title mt-2 text-[34px] sm:text-[44px]">
              Somos Azu y Jaz
            </h2>
            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-tinta/75">
              Licenciadas en Terapia Ocupacional. Creamos ADAPTO para compartir herramientas, ideas y recursos que acompañen cada etapa de la vida.
            </p>
            <Link href="/nosotras" className="btn-ink mt-6">
              Conocenos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" className="scroll-mt-20 bg-white py-20 sm:py-24" aria-labelledby="preguntas-titulo">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow">Dudas</p>
            <h2 id="preguntas-titulo" className="title mt-2 text-[34px] sm:text-[44px]">
              Preguntas frecuentes
            </h2>
            <p className="mt-3 text-[16px] text-gris">¿No encontrás tu respuesta? Escribinos y te ayudamos.</p>
            <a href={whatsappUrl(site.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-5">
              <WhatsAppIcon className="h-4 w-4" />
              Escribinos
            </a>
          </Reveal>
          <Reveal delay={60}>
            <div className="divide-y-2 divide-linea border-y-2 border-linea">
              {faqs.map((item) => (
                <details key={item.q} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold">
                    {item.q}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-crema transition-transform duration-200 group-open:rotate-45">
                      <Plus className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="pb-5 pr-10 text-[16px] leading-relaxed text-tinta/75">{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
