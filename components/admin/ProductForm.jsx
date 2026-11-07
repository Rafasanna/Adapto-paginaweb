"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { audiences } from "@/config/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TopicIcon } from "@/components/site/TopicIcon";
import { PreviewsEditor } from "./PreviewsEditor";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

function initialState(product, categories) {
  return {
    name: product?.name || "",
    slug: product?.slug || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    price: product?.price != null ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice != null ? String(product.compareAtPrice) : "",
    categoryId: product?.categoryId || categories[0]?.id || "",
    subcategoryId: product?.subcategoryId || "",
    audiences: product?.audiences || [],
    previews: product?.previews || [],
    pageCount: product?.pageCount != null ? String(product.pageCount) : "",
    format: product?.format || "PDF",
    featured: product?.featured || false,
    visible: product ? product.visible : true
  };
}

export function ProductForm({ product, categories, subcategories }) {
  const router = useRouter();
  const isNew = !product;
  const [form, setForm] = useState(() => initialState(product, categories));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  const set = (key, value) => {
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  // Aviso si se intenta cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const topics = useMemo(() => subcategories.filter((item) => item.categoryId === form.categoryId), [subcategories, form.categoryId]);
  const slug = slugTouched ? form.slug : slugify(form.name);

  async function save(event) {
    event.preventDefault();
    setError("");
    if (!form.previews.length && form.visible) {
      setError("Agregá al menos una página de vista previa (o guardalo oculto por ahora).");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        slug,
        price: form.price === "" ? "" : Number(form.price),
        compareAtPrice: form.compareAtPrice === "" ? null : Number(form.compareAtPrice),
        pageCount: form.pageCount === "" ? null : Number(form.pageCount),
        subcategoryId: form.subcategoryId || null
      };
      const response = await fetch(isNew ? "/api/admin/products" : `/api/admin/products/${product.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "No se pudo guardar el producto.");
      setDirty(false);
      router.push(`/admin?ok=${isNew ? "creado" : "guardado"}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError.message);
      setSaving(false);
    }
  }

  const field = "mt-1.5 w-full rounded-xl border-2 border-linea bg-white px-3.5 text-[16px] outline-none transition-colors focus:border-teal-deep";
  const priceNumber = Number(form.price) || 0;
  const compareNumber = Number(form.compareAtPrice) || 0;

  return (
    <form onSubmit={save} noValidate>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-gris hover:text-tinta">
        <ArrowLeft className="h-4 w-4" />
        Productos
      </Link>
      <h1 className="title mt-2 text-[30px] sm:text-[36px]">{isNew ? "Nuevo producto" : "Editar producto"}</h1>

      {/* minmax(0, …) y min-w-0: la fila de páginas no puede ensanchar la columna (mobile) */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
        <div className="grid min-w-0 gap-5">
          <Section title="Vista previa" hint="Las páginas que pasan en el carrusel de la tienda. La primera es la portada.">
            <PreviewsEditor
              previews={form.previews}
              onChange={(next) => set("previews", next)}
              onPdfInfo={({ numPages, name }) => {
                if (!form.pageCount) set("pageCount", String(numPages));
                if (!form.name) set("name", name.replace(/[-_]+/g, " ").trim());
              }}
              disabled={saving}
            />
          </Section>

          <Section title="Datos del producto">
            <label className="block text-[14px] font-medium">
              Nombre *
              <input value={form.name} onChange={(event) => set("name", event.target.value)} maxLength={140} required className={cn(field, "h-12")} />
            </label>
            <label className="mt-4 block text-[14px] font-medium">
              Dirección en la tienda
              <span className="mt-1.5 flex items-center rounded-xl border-2 border-linea bg-crema focus-within:border-teal-deep">
                <span className="shrink-0 pl-3.5 text-[14px] text-gris">/productos/</span>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    set("slug", slugify(event.target.value) + (event.target.value.endsWith("-") ? "-" : ""));
                  }}
                  maxLength={80}
                  className="h-11 min-w-0 flex-1 rounded-r-xl bg-white px-2 text-[15px] outline-none"
                />
              </span>
              <span className="mt-1 block text-[12.5px] font-normal text-gris">Se arma sola con el nombre. Si la cambiás, los links viejos dejan de andar.</span>
            </label>
            <label className="mt-4 block text-[14px] font-medium">
              Descripción corta
              <input
                value={form.shortDescription}
                onChange={(event) => set("shortDescription", event.target.value)}
                maxLength={280}
                placeholder="Una línea que aparece debajo del nombre"
                className={cn(field, "h-12")}
              />
            </label>
            <label className="mt-4 block text-[14px] font-medium">
              Descripción
              <textarea
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
                maxLength={6000}
                rows={6}
                placeholder="Qué trabaja, para quién es, cómo se usa… Dejá una línea en blanco entre párrafos."
                className={cn(field, "py-3 leading-relaxed")}
              />
            </label>
          </Section>
        </div>

        <div className="grid min-w-0 gap-5">
          <Section title="Precio">
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[14px] font-medium">
                Precio *
                <span className="relative block">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-gris">$</span>
                  <input
                    inputMode="numeric"
                    value={form.price}
                    onChange={(event) => set("price", event.target.value.replace(/\D/g, ""))}
                    required
                    className={cn(field, "h-12 pl-7 tabular-nums")}
                  />
                </span>
              </label>
              <label className="block text-[14px] font-medium">
                Precio anterior
                <span className="relative block">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-gris">$</span>
                  <input
                    inputMode="numeric"
                    value={form.compareAtPrice}
                    onChange={(event) => set("compareAtPrice", event.target.value.replace(/\D/g, ""))}
                    placeholder="Opcional"
                    className={cn(field, "h-12 pl-7 tabular-nums")}
                  />
                </span>
              </label>
            </div>
            <p className="mt-2 text-[13px] text-gris">
              {priceNumber ? `Se muestra como ${formatPrice(priceNumber)}.` : "En pesos, sin centavos."}
              {compareNumber > priceNumber && priceNumber ? ` Oferta: antes ${formatPrice(compareNumber)} (−${Math.round((1 - priceNumber / compareNumber) * 100)}%).` : ""}
              {" "}El precio anterior es solo para mostrar una oferta.
            </p>
          </Section>

          <Section title="Clasificación">
            <span className="text-[14px] font-medium">Categoría *</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={form.categoryId === category.id}
                  onClick={() => {
                    set("categoryId", category.id);
                    set("subcategoryId", "");
                  }}
                  className={cn(
                    "chip min-h-[42px] px-4 text-[15px] font-semibold",
                    form.categoryId === category.id ? "border-teal-dark bg-teal text-tinta" : "border-linea bg-white"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <span className="mt-4 block text-[14px] font-medium">Tema</span>
            <div className="mt-1.5 grid gap-1.5">
              {topics.map((topic) => {
                const active = form.subcategoryId === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set("subcategoryId", active ? "" : topic.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border-2 py-1 pl-1 pr-3 text-left text-[15px]",
                      active ? "border-teal bg-teal-soft font-semibold" : "border-transparent bg-crema/60 hover:bg-crema"
                    )}
                  >
                    <TopicIcon name={topic.icon} color={topic.color} className="h-8 w-8" />
                    {topic.longName || topic.name}
                  </button>
                );
              })}
            </div>

            <span className="mt-4 block text-[14px] font-medium">Para</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {audiences.map((item) => {
                const active = form.audiences.includes(item.slug);
                return (
                  <button
                    key={item.slug}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set("audiences", active ? form.audiences.filter((value) => value !== item.slug) : [...form.audiences, item.slug])}
                    className={cn("chip min-h-[40px] px-4 text-[15px]", active ? "border-teal-dark bg-teal text-tinta" : "border-linea bg-white")}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Detalles">
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[14px] font-medium">
                Páginas
                <input
                  inputMode="numeric"
                  value={form.pageCount}
                  onChange={(event) => set("pageCount", event.target.value.replace(/\D/g, ""))}
                  placeholder="Se completa con el PDF"
                  className={cn(field, "h-12 tabular-nums")}
                />
              </label>
              <label className="block text-[14px] font-medium">
                Formato
                <input value={form.format} onChange={(event) => set("format", event.target.value)} maxLength={20} className={cn(field, "h-12")} />
              </label>
            </div>
          </Section>

          <Section title="Publicación">
            <Toggle
              checked={form.visible}
              onChange={(value) => set("visible", value)}
              label="Visible en la tienda"
              hint="Si lo apagás, queda guardado pero nadie lo ve."
            />
            <Toggle
              checked={form.featured}
              onChange={(value) => set("featured", value)}
              label="Destacado"
              hint="Aparece primero y en el inicio."
              className="mt-3"
            />
          </Section>
        </div>
      </div>

      {/* Barra fija para guardar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-linea bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          {error ? (
            <p role="alert" className="w-full rounded-xl bg-pink-soft px-3.5 py-2 text-[14px] text-pink-ink sm:order-none sm:w-auto sm:flex-1">
              {error}
            </p>
          ) : (
            <p className="hidden flex-1 text-[14px] text-gris sm:block">{dirty ? "Hay cambios sin guardar." : "Sin cambios."}</p>
          )}
          <Link href="/admin" className="btn-outline ml-auto">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="btn-primary min-w-[150px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="min-w-0 rounded-[24px] bg-white p-4 sm:p-6">
      <h2 className="text-[18px] font-semibold">{title}</h2>
      {hint ? <p className="mt-0.5 text-[14px] text-gris">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, hint, className }) {
  return (
    <label className={cn("flex cursor-pointer items-start justify-between gap-4", className)}>
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {hint ? <span className="block text-[13px] text-gris">{hint}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full bg-linea transition-colors peer-checked:bg-teal-deep peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-deep" />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
