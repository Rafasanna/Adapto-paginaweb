import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { colorClass } from "@/lib/colors";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Doodle } from "@/components/site/Doodles";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppIcon } from "@/components/site/icons";

export const metadata = {
  title: "Nosotras",
  description: "Somos Azu y Jaz, Licenciadas en Terapia Ocupacional. Creamos ADAPTO para compartir recursos terapéuticos listos para imprimir."
};

const values = [
  {
    shape: "puzzle",
    color: "purple",
    title: "Desde la práctica",
    text: "Herramientas e ideas pensadas para acompañar y enriquecer intervenciones reales."
  },
  {
    shape: "pencil",
    color: "pink",
    title: "Listos para imprimir",
    text: "Recursos digitales claros, ordenados y fáciles de usar en la sesión, el aula o la casa."
  },
  {
    shape: "flower",
    color: "green",
    title: "Para cada etapa",
    text: "Propuestas para niños, adolescentes y adultos, y también para sus familias y acompañantes."
  }
];

export default function NosotrasPage() {
  return (
    <>
      <section className="bg-dots relative overflow-hidden">
        <Doodle shape="star" color="yellow" className="absolute right-[8%] top-10 hidden h-14 w-14 animate-float sm:block" style={{ "--r": "12deg" }} />
        <div className="container-site relative pb-14 pt-10 sm:pt-16">
          <p className="eyebrow">Nosotras</p>
          <h1 className="title mt-2 max-w-3xl text-[42px] sm:text-[60px]">Somos Azu y Jaz</h1>
          <p className="mt-3 text-[19px] font-semibold text-purple-ink sm:text-[21px]">Licenciadas en Terapia Ocupacional</p>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-tinta/75 sm:text-[18px]">{site.welcome.paragraphs[0]}</p>
        </div>
      </section>

      <section className="container-site" aria-label="Equipo">
        <ul className="grid gap-6 sm:grid-cols-2 lg:gap-10">
          {site.team.map((person, index) => {
            const color = colorClass(person.color);
            return (
              <Reveal as="li" key={person.name} delay={index * 100} className={cn("rounded-[32px] border-2 p-6 sm:p-8", color.soft, color.border)}>
                <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px]">
                  <Doodle
                    shape={index === 0 ? "star" : "heart"}
                    color={index === 0 ? "yellow" : "pink"}
                    className="absolute -right-2 top-2 z-10 h-14 w-14 rotate-12"
                  />
                  <div className={cn("rounded-full border-[3px] bg-white p-2", color.border)}>
                    <Image
                      src={person.photo}
                      alt={`${person.name}, ${person.role}`}
                      width={600}
                      height={600}
                      sizes="(min-width: 640px) 300px, 80vw"
                      className="aspect-square w-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h2 className="title text-[34px]">{person.name}</h2>
                  <p className={cn("mt-1 text-[16px] font-semibold", color.text)}>{person.role}</p>
                  {person.bio ? <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-tinta/75">{person.bio}</p> : null}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className="container-site pt-24" aria-labelledby="por-que">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Por qué ADAPTO</p>
          <h2 id="por-que" className="title mt-2 text-[34px] sm:text-[44px]">
            Un espacio para aprender, crear y encontrar recursos
          </h2>
        </Reveal>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {values.map((value, index) => (
            <Reveal as="li" key={value.title} delay={index * 80} className="rounded-[26px] bg-white p-6">
              <Doodle shape={value.shape} color={value.color} className="h-12 w-12" />
              <h3 className="mt-4 text-[20px] font-semibold">{value.title}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-tinta/70">{value.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="container-site pt-20">
        <Reveal className="flex flex-col items-start justify-between gap-6 rounded-[32px] bg-tinta px-6 py-10 text-crema sm:px-10 md:flex-row md:items-center">
          <div>
            <h2 className="title text-[28px] text-crema sm:text-[34px]">¿Buscás algo en particular?</h2>
            <p className="mt-2 max-w-lg text-[16px] text-crema/75">Contanos qué necesitás trabajar y te recomendamos el recurso indicado.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={whatsappUrl("¡Hola Azu y Jaz! 👋 Les quería consultar por un recurso.")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <WhatsAppIcon className="h-4 w-4" />
              Escribinos
            </a>
            <Link href="/recursos" className="btn border-crema/40 text-crema hover:-translate-y-0.5 hover:bg-crema hover:text-tinta">
              Ver recursos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
