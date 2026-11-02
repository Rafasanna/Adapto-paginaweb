"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PagePreview } from "./PagePreview";
import { Price } from "./Price";
import { toCartItem, useCart } from "./CartProvider";

// Tarjeta de producto: la hoja (con carrusel) sobre un fondo crema neutro.
// Toda la tarjeta lleva al detalle; el "+" agrega una unidad sin salir de la página.
export function ProductCard({ product, subcategory, index = 0, priority = false }) {
  const { addItem } = useCart();
  const href = `/productos/${product.slug}`;

  return (
    <article className="group relative flex w-full flex-col">
      {/* El contenedor no se transforma: así el "+" (z-10) queda siempre por encima del link de la tarjeta */}
      <div className="relative">
        <div className="relative rounded-[22px] bg-crema px-[14%] pb-6 pt-[12%] transition-transform duration-300 group-hover:-translate-y-1">
          <PagePreview previews={product.previews} name={product.name} offset={index} priority={priority} className="transition-transform duration-300 group-hover:rotate-[-1.5deg]" />

          {product.featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-teal-deep px-2.5 py-0.5 text-[12px] font-semibold text-white">Destacado</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => addItem(toCartItem(product, subcategory?.name))}
          className="absolute bottom-3 right-3 z-10 grid h-11 w-11 place-items-center rounded-full border-2 border-teal bg-white text-teal-ink shadow-sm transition-[transform,background-color,color] duration-300 hover:bg-teal-deep hover:text-white active:scale-95 group-hover:-translate-y-1"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <Plus className="h-5 w-5" strokeWidth={2.6} />
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col px-1">
        {subcategory ? (
          <p className="text-[13px] font-medium text-gris">{subcategory.name}</p>
        ) : null}
        <h3 className="mt-0.5 text-[16px] font-semibold leading-snug sm:text-[17px]">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-teal-deep">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="mt-1.5" />
      </div>
    </article>
  );
}
