"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { formatPrice, normalize, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

const notices = {
  creado: "Producto creado. Ya está en la tienda.",
  guardado: "Cambios guardados.",
  borrado: "Producto borrado."
};

export function ProductList({ products }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [error, setError] = useState("");
  const notice = notices[params.get("ok")] || "";

  const filtered = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return products;
    return products.filter((product) => {
      const haystack = normalize(`${product.name} ${product.subcategoryName || ""} ${product.categoryName}`);
      return words.every((word) => haystack.includes(word));
    });
  }, [products, query]);

  async function patch(product, changes) {
    setBusy(product.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "No se pudo guardar.");
      router.refresh();
    } catch (patchError) {
      setError(patchError.message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(product) {
    setBusy(product.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "No se pudo borrar.");
      setConfirming(null);
      router.replace("/admin?ok=borrado");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(null);
    }
  }

  const visibleCount = products.filter((product) => product.visible).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="title text-[32px] sm:text-[38px]">Productos</h1>
          <p className="mt-1 text-[15px] text-gris">
            {pluralize(products.length, "producto", "productos")} · {visibleCount} visibles en la tienda
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          <Plus className="h-4 w-4" strokeWidth={2.6} />
          Nuevo producto
        </Link>
      </div>

      {notice ? (
        <p role="status" className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-teal-soft px-4 py-3 text-[15px] text-teal-ink">
          {notice}
          <button type="button" onClick={() => router.replace("/admin")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/70" aria-label="Cerrar aviso">
            <X className="h-4 w-4" />
          </button>
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-5 rounded-2xl bg-pink-soft px-4 py-3 text-[15px] text-pink-ink">
          {error}
        </p>
      ) : null}

      {products.length ? (
        <>
          <label className="relative mt-6 block max-w-md">
            <span className="sr-only">Buscar productos</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gris" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o tema…"
              className="h-11 w-full rounded-full border-2 border-linea bg-white pl-10 pr-4 text-[15px] outline-none focus:border-teal-deep"
            />
          </label>

          <ul className="mt-5 grid gap-3">
            {filtered.map((product) => {
              const cover = product.previews[0]?.url;
              const isBusy = busy === product.id;
              return (
                <li
                  key={product.id}
                  className={cn("rounded-2xl bg-white p-3 transition-opacity sm:p-4", isBusy && "opacity-60", !product.visible && "bg-white/60")}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <Link href={`/admin/productos/${product.id}`} className="paper relative block h-[86px] w-[62px] shrink-0 bg-crema sm:h-[100px] sm:w-[72px]">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="grid h-full place-items-center px-1 text-center text-[11px] text-gris">Sin vista previa</span>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {!product.visible ? <span className="rounded-full bg-crema px-2 py-0.5 text-[12px] font-semibold text-gris">Oculto</span> : null}
                        {product.featured ? <span className="rounded-full bg-teal-dark px-2 py-0.5 text-[12px] font-semibold text-tinta">Destacado</span> : null}
                        <span className="text-[13px] text-gris">{product.subcategoryName || product.categoryName}</span>
                      </div>
                      <Link href={`/admin/productos/${product.id}`} className="mt-0.5 block text-[16px] font-semibold leading-snug hover:underline sm:text-[17px]">
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-[15px] tabular-nums">
                        {formatPrice(product.price)}
                        {product.compareAtPrice ? <span className="ml-2 text-[13px] text-gris line-through">{formatPrice(product.compareAtPrice)}</span> : null}
                      </p>
                    </div>
                  </div>

                  {confirming === product.id ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-pink-soft p-3 text-[14px]">
                      <span className="mr-auto font-medium text-pink-ink">¿Borrar “{product.name}”? No se puede deshacer.</span>
                      <button type="button" onClick={() => setConfirming(null)} className="btn-outline min-h-[38px] px-4 text-[14px]">
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(product)}
                        disabled={isBusy}
                        className="btn min-h-[38px] border-pink-ink bg-pink-ink px-4 text-[14px] text-white hover:opacity-90"
                      >
                        Sí, borrar
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t-2 border-crema pt-3">
                      <Link href={`/admin/productos/${product.id}`} className="chip min-h-[36px] border-linea bg-white text-[14px] hover:border-teal">
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => patch(product, { visible: !product.visible })}
                        className="chip min-h-[36px] border-linea bg-white text-[14px] hover:border-teal"
                      >
                        {product.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {product.visible ? "Ocultar" : "Mostrar en la tienda"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => patch(product, { featured: !product.featured })}
                        className="chip min-h-[36px] border-linea bg-white text-[14px] hover:border-teal"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {product.featured ? "Quitar de destacados" : "Destacar"}
                      </button>
                      {product.visible ? (
                        <a
                          href={`/productos/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chip min-h-[36px] border-transparent text-[14px] text-gris hover:text-tinta"
                        >
                          Ver
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setConfirming(product.id)}
                        className="chip ml-auto min-h-[36px] border-transparent text-[14px] text-pink-ink hover:bg-pink-soft"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Borrar
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {!filtered.length ? <p className="mt-6 text-[15px] text-gris">No hay productos que coincidan con “{query}”.</p> : null}
        </>
      ) : (
        <div className="mt-8 rounded-[28px] border-2 border-dashed border-linea bg-white px-6 py-14 text-center">
          <p className="title text-[22px]">Todavía no hay productos</p>
          <p className="mx-auto mt-2 max-w-sm text-[15px] text-gris">
            Cargá el primero: elegís el PDF, las páginas que querés mostrar y completás los datos.
          </p>
          <Link href="/admin/productos/nuevo" className="btn-primary mt-6">
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            Cargar el primer producto
          </Link>
        </div>
      )}
    </div>
  );
}
