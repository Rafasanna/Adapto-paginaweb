"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { audiences, sortOptions } from "@/config/catalog";
import { site } from "@/config/site";
import { normalize, pluralize } from "@/lib/format";
import { colorClass } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { TopicIcon } from "@/components/site/TopicIcon";
import { WhatsAppIcon } from "@/components/site/icons";
import { ProductCard } from "./ProductCard";

// Filtros en la URL: ?categoria=actividades&tema=escritura&para=ninos&orden=nuevos&q=trazos

export function Catalog({ categories, subcategories, products }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const temaParam = params.get("tema") || "";
  const topic = subcategories.find((item) => item.slug === temaParam) || null;
  // Si viene un tema, la categoría sale de ese tema
  const category = topic?.category || params.get("categoria") || "";
  const audience = params.get("para") || "";
  const sort = params.get("orden") || "destacados";
  const queryParam = params.get("q") || "";

  const [query, setQuery] = useState(queryParam);
  useEffect(() => setQuery(queryParam), [queryParam]);

  const update = (changes) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (next.get("orden") === "destacados") next.delete("orden");
    const search = next.toString();
    startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false }));
  };

  // Búsqueda con una pausa corta para no actualizar la URL en cada letra
  useEffect(() => {
    if (query === queryParam) return undefined;
    const timer = setTimeout(() => update({ q: query.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const subBySlug = useMemo(() => new Map(subcategories.map((item) => [item.slug, item])), [subcategories]);
  const visibleTopics = category ? subcategories.filter((item) => item.category === category) : subcategories;

  const results = useMemo(() => {
    const words = normalize(queryParam).split(/\s+/).filter(Boolean);
    const list = products.filter((product) => {
      if (category && product.category !== category) return false;
      if (topic && product.subcategory !== topic.slug) return false;
      if (audience && !product.audiences.includes(audience)) return false;
      if (words.length) {
        const sub = subBySlug.get(product.subcategory);
        const haystack = normalize([product.name, product.shortDescription, sub?.name, sub?.longName, sub?.detail].join(" "));
        if (!words.every((word) => haystack.includes(word))) return false;
      }
      return true;
    });
    const sorted = [...list];
    if (sort === "nuevos") sorted.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    else if (sort === "menor-precio") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "mayor-precio") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    return sorted;
  }, [products, category, topic, audience, queryParam, sort, subBySlug]);

  const countByTopic = useMemo(() => {
    const map = new Map();
    for (const product of products) map.set(product.subcategory, (map.get(product.subcategory) || 0) + 1);
    return map;
  }, [products]);

  const hasFilters = Boolean(category || topic || audience || queryParam);
  const clearAll = () => {
    setQuery("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  return (
    <div>
      {/* Búsqueda + orden */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar recursos</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gris" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o tema…"
            className="h-12 w-full rounded-full border-2 border-linea bg-white pl-11 pr-11 text-[15px] outline-none transition-colors placeholder:text-gris/80 focus:border-purple [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full hover:bg-crema"
              aria-label="Borrar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
        <label className="relative sm:w-[210px]">
          <span className="sr-only">Ordenar</span>
          <select
            value={sort}
            onChange={(event) => update({ orden: event.target.value })}
            className="h-12 w-full cursor-pointer appearance-none rounded-full border-2 border-linea bg-white pl-4 pr-10 text-[15px] font-medium outline-none focus:border-purple"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
        </label>
      </div>

      {/* Categorías */}
      <div className="mt-6 flex gap-2" role="group" aria-label="Categoría">
        {[{ slug: "", name: "Todo", color: "yellow" }, ...categories].map((item) => {
          const active = category === item.slug;
          const color = colorClass(item.color);
          return (
            <button
              key={item.slug || "todo"}
              type="button"
              aria-pressed={active}
              onClick={() => update({ categoria: item.slug, tema: "" })}
              className={cn(
                "chip min-h-[42px] px-5 text-[15px] font-semibold",
                active ? cn(color.bg, color.border) : "border-linea bg-white hover:border-tinta/30"
              )}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Temas (subcategorías) */}
      <div className="-mx-4 mt-3 px-4 sm:mx-0 sm:px-0">
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible" role="group" aria-label="Tema">
          {visibleTopics.map((item) => {
            const active = topic?.slug === item.slug;
            const color = colorClass(item.color);
            const count = countByTopic.get(item.slug) || 0;
            return (
              <button
                key={item.slug}
                type="button"
                aria-pressed={active}
                onClick={() => update({ tema: active ? "" : item.slug, categoria: active ? category : item.category })}
                className={cn("chip pl-1.5", active ? cn(color.soft, color.border) : "border-transparent bg-white/70 hover:bg-white")}
              >
                <TopicIcon name={item.icon} color={item.color} className="h-7 w-7" />
                {item.name}
                <span className={cn("text-[12px] tabular-nums", active ? color.text : "text-gris")}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Para quién */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[14px] font-medium text-gris">Para:</span>
        {audiences.map((item) => {
          const active = audience === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              aria-pressed={active}
              onClick={() => update({ para: active ? "" : item.slug })}
              className={cn(
                "chip min-h-[34px] px-3 text-[13.5px]",
                active ? "border-tinta bg-tinta text-crema" : "border-linea bg-transparent hover:border-tinta/40"
              )}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-linea pb-3">
        <div>
          {topic ? (
            <>
              <h2 className="title text-[26px]">{topic.longName || topic.name}</h2>
              {topic.detail ? <p className="text-[15px] text-gris">{topic.detail}</p> : null}
            </>
          ) : (
            <h2 className="title text-[26px]">{category ? categories.find((item) => item.slug === category)?.name : "Todos los recursos"}</h2>
          )}
        </div>
        <div className="flex items-center gap-4 text-[14px]">
          <span className="text-gris" aria-live="polite">
            {pluralize(results.length, "recurso", "recursos")}
          </span>
          {hasFilters ? (
            <button type="button" onClick={clearAll} className="font-semibold underline underline-offset-2">
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </div>

      {results.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
          {results.map((product, index) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} subcategory={subBySlug.get(product.subcategory)} index={index} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState noProducts={products.length === 0} onClear={hasFilters ? clearAll : null} />
      )}
    </div>
  );
}

function EmptyState({ noProducts, onClear }) {
  return (
    <div className="mx-auto mt-14 max-w-md text-center">
      <TopicIcon name={noProducts ? "cognitiva" : "emociones"} color={noProducts ? "yellow" : "teal"} className="mx-auto h-20 w-20" />
      <p className="title mt-4 text-[22px]">{noProducts ? "Estamos preparando los primeros recursos" : "No encontramos recursos con esos filtros"}</p>
      <p className="mt-2 text-[15px] text-gris">
        {noProducts
          ? "Muy pronto vas a encontrar acá todo el material. Si buscás algo en particular, escribinos."
          : "Probá con otra búsqueda o sacá algún filtro. Si no lo encontrás, consultanos: quizás lo tenemos en camino."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {onClear ? (
          <button type="button" onClick={onClear} className="btn-outline">
            Limpiar filtros
          </button>
        ) : null}
        <Link href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          <WhatsAppIcon className="h-4 w-4" />
          Consultar
        </Link>
      </div>
    </div>
  );
}
