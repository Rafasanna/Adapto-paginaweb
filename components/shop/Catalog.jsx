"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { audiences, sortOptions } from "@/config/catalog";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { normalize, pluralize } from "@/lib/format";
import { colorClass } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { TopicIcon } from "@/components/site/TopicIcon";
import { WhatsAppIcon } from "@/components/site/icons";
import { ProductCard } from "./ProductCard";

// Filtros en la URL: ?categoria=actividades&tema=escritura&para=ninos&orden=nuevos&q=trazos
// La búsqueda (?q=) se escribe desde el buscador del header.
// Los filtros viven en un panel que se abre con el botón "Filtros".

export function Catalog({ categories, subcategories, products }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [panelOpen, setPanelOpen] = useState(false);

  const topic = subcategories.find((item) => item.slug === params.get("tema")) || null;
  // Si viene un tema, la categoría sale de ese tema
  const category = topic?.category || params.get("categoria") || "";
  const audience = params.get("para") || "";
  const sort = params.get("orden") || "destacados";
  const query = params.get("q") || "";

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

  const subBySlug = useMemo(() => new Map(subcategories.map((item) => [item.slug, item])), [subcategories]);
  const categoryBySlug = useMemo(() => new Map(categories.map((item) => [item.slug, item])), [categories]);

  // Aplica todo menos lo que se pida ignorar (para calcular cuántos quedan por opción)
  const filterProducts = (ignore = {}) => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      if (!ignore.category && category && product.category !== category) return false;
      if (!ignore.topic && topic && product.subcategory !== topic.slug) return false;
      if (!ignore.audience && audience && !product.audiences.includes(audience)) return false;
      if (words.length) {
        const sub = subBySlug.get(product.subcategory);
        const haystack = normalize([product.name, product.shortDescription, sub?.name, sub?.longName, sub?.detail].join(" "));
        if (!words.every((word) => haystack.includes(word))) return false;
      }
      return true;
    });
  };

  const results = useMemo(() => {
    const sorted = filterProducts();
    if (sort === "nuevos") sorted.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    else if (sort === "menor-precio") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "mayor-precio") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, category, topic, audience, query, sort]);

  // Cantidad por tema respetando los demás filtros (categoría no, porque el tema ya la define)
  const countByTopic = useMemo(() => {
    const map = new Map();
    for (const product of filterProducts({ topic: true, category: true })) {
      map.set(product.subcategory, (map.get(product.subcategory) || 0) + 1);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, audience, query]);

  const activeFilters = [
    category && !topic ? { key: "categoria", label: categoryBySlug.get(category)?.name, clear: { categoria: "" } } : null,
    topic ? { key: "tema", label: topic.name, clear: { tema: "", categoria: "" } } : null,
    audience ? { key: "para", label: `Para ${audiences.find((item) => item.slug === audience)?.name.toLowerCase()}`, clear: { para: "" } } : null,
    query ? { key: "q", label: `“${query}”`, clear: { q: "" } } : null
  ].filter(Boolean);
  const filterCount = activeFilters.filter((item) => item.key !== "q").length;

  const clearAll = () => startTransition(() => router.replace(pathname, { scroll: false }));
  const clearFilters = () => update({ categoria: "", tema: "", para: "" });

  const title = query
    ? `Resultados para “${query}”`
    : topic
      ? topic.longName || topic.name
      : category
        ? categoryBySlug.get(category)?.name
        : "Todos los productos";

  return (
    <div>
      {/* Barra: Filtros + filtros activos + orden */}
      <div className="flex flex-wrap items-center gap-2 border-y-2 border-linea py-3">
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={panelOpen}
          className={cn(
            "chip min-h-[44px] gap-2 px-4 text-[15px] font-semibold",
            filterCount ? "border-teal-dark bg-teal text-tinta" : "border-teal-dark bg-white hover:bg-teal-soft"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={2.4} />
          Filtros
          {filterCount ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal px-1 text-[12px] font-bold text-tinta">{filterCount}</span>
          ) : null}
        </button>

        <div className="order-3 -mx-4 w-[calc(100%+2rem)] px-4 sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:px-0">
          {activeFilters.length ? (
            <ul className="scrollbar-none flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible" aria-label="Filtros aplicados">
              {activeFilters.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => update(item.clear)}
                    className="chip min-h-[36px] whitespace-nowrap border-linea bg-white pr-2 text-[14px] hover:border-tinta/40"
                    aria-label={`Quitar filtro ${item.label}`}
                  >
                    {item.label}
                    <X className="h-3.5 w-3.5 text-gris" />
                  </button>
                </li>
              ))}
              {activeFilters.length > 1 ? (
                <li>
                  <button type="button" onClick={clearAll} className="whitespace-nowrap px-2 text-[14px] font-semibold underline underline-offset-2">
                    Limpiar todo
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

        <label className="relative ml-auto">
          <span className="sr-only">Ordenar</span>
          <select
            value={sort}
            onChange={(event) => update({ orden: event.target.value })}
            className="h-11 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-transparent pl-3 pr-9 text-right text-[15px] font-medium outline-none hover:bg-crema focus:border-teal-deep"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </label>
      </div>

      {/* Título de la vista */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="title text-[26px] sm:text-[30px]">{title}</h2>
          {!query && topic?.detail ? <p className="text-[15px] text-gris">{topic.detail}</p> : null}
        </div>
        <span className="text-[14px] text-gris" aria-live="polite">
          {pluralize(results.length, "producto", "productos")}
        </span>
      </div>

      {results.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
          {results.map((product, index) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} subcategory={subBySlug.get(product.subcategory)} index={index} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState noProducts={products.length === 0} onClear={activeFilters.length ? clearAll : null} />
      )}

      {panelOpen ? (
        <FilterPanel
          onClose={() => setPanelOpen(false)}
          categories={categories}
          subcategories={subcategories}
          category={category}
          topic={topic}
          audience={audience}
          countByTopic={countByTopic}
          resultCount={results.length}
          filterCount={filterCount}
          update={update}
          clearFilters={clearFilters}
        />
      ) : null}
    </div>
  );
}

// Panel de filtros: lateral en desktop, hoja que sube desde abajo en mobile.
// Los cambios se aplican al instante; el botón de abajo muestra cuántos productos quedan.
function FilterPanel({ onClose, categories, subcategories, category, topic, audience, countByTopic, resultCount, filterCount, update, clearFilters }) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);
  const visibleTopics = category ? subcategories.filter((item) => item.category === category) : subcategories;

  useEffect(() => {
    setMounted(true);
    const previous = document.activeElement;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="Cerrar filtros" className="absolute inset-0 animate-fade-in bg-tinta/40 backdrop-blur-[2px]" onClick={onClose} />
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filtros-titulo"
        className={cn(
          "absolute flex flex-col bg-crema shadow-2xl outline-none",
          // mobile: hoja desde abajo · desktop: panel lateral izquierdo
          "inset-x-0 bottom-0 max-h-[88vh] animate-sheet-up rounded-t-[28px]",
          "md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-[400px] md:animate-slide-in-left md:rounded-none"
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-tinta/15 md:hidden" aria-hidden="true" />
        <header className="flex items-center justify-between px-5 pb-3 pt-3 md:pt-5">
          <h2 id="filtros-titulo" className="title text-[24px]">
            Filtros
          </h2>
          <button type="button" onClick={onClose} className="-mr-2 grid h-11 w-11 place-items-center rounded-full hover:bg-white" aria-label="Cerrar filtros">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 pb-6">
          <fieldset>
            <legend className="eyebrow">Categoría</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {[{ slug: "", name: "Todo" }, ...categories].map((item) => {
                const active = category === item.slug;
                return (
                  <button
                    key={item.slug || "todo"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ categoria: item.slug, tema: "" })}
                    className={cn("chip min-h-[42px] px-4 text-[15px] font-semibold", active ? "border-teal-dark bg-teal text-tinta" : "border-linea bg-white hover:border-tinta/30")}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow">Tema</legend>
            <ul className="mt-3 grid gap-1.5">
              {visibleTopics.map((item) => {
                const active = topic?.slug === item.slug;
                const color = colorClass(item.color);
                const count = countByTopic.get(item.slug) || 0;
                return (
                  <li key={item.slug}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => update({ tema: active ? "" : item.slug, categoria: active ? category : item.category })}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border-2 py-1.5 pl-1.5 pr-3 text-left transition-colors",
                        active ? "border-teal bg-teal-soft" : "border-transparent hover:bg-white"
                      )}
                    >
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", active ? "bg-white" : color.soft)}>
                        <TopicIcon name={item.icon} color={item.color} className="h-8 w-8" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[15px] font-medium leading-tight">{item.longName || item.name}</span>
                        {item.detail ? <span className="mt-0.5 block text-[12.5px] leading-snug text-gris">{item.detail}</span> : null}
                      </span>
                      {active ? (
                        <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                      ) : (
                        <span className="shrink-0 text-[13px] tabular-nums text-gris">{count}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="eyebrow">Para</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {audiences.map((item) => {
                const active = audience === item.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ para: active ? "" : item.slug })}
                    className={cn("chip min-h-[42px] px-4 text-[15px]", active ? "border-teal-dark bg-teal text-tinta" : "border-linea bg-white hover:border-tinta/40")}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <footer className="flex items-center gap-3 border-t-2 border-linea bg-papel px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!filterCount}
            className="px-2 text-[15px] font-semibold underline underline-offset-2 disabled:no-underline disabled:opacity-40"
          >
            Limpiar
          </button>
          <button type="button" onClick={onClose} className="btn-primary ml-auto flex-1 sm:flex-none sm:px-6">
            Ver {pluralize(resultCount, "producto", "productos")}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}

function EmptyState({ noProducts, onClear }) {
  return (
    <div className="mx-auto mt-14 max-w-md text-center">
      <TopicIcon name={noProducts ? "cognitiva" : "emociones"} color="teal" className="mx-auto h-20 w-20" />
      <p className="title mt-4 text-[22px]">{noProducts ? "Estamos preparando los primeros productos" : "No encontramos productos con esos filtros"}</p>
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
        <Link href={whatsappUrl(site.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          <WhatsAppIcon className="h-4 w-4" />
          Consultar
        </Link>
      </div>
    </div>
  );
}
