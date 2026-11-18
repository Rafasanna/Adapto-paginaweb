"use client";

import { isPromoActive, promoDescription, promoLabel, promoUnitPrice } from "@/lib/promo";
import { Price } from "./Price";
import { useCart } from "./CartProvider";

// Precio del producto con la promo de la tienda aplicada.
// Con % OFF: precio nuevo y el original tachado. Con 2x1/3x2: el precio normal (el descuento se ve en el carrito).
export function ProductPrice({ product, size, className }) {
  const { promo } = useCart();
  if (promo?.type === "percent") {
    const original = Math.max(product.price, product.compareAtPrice || 0);
    return <Price price={promoUnitPrice(product.price, promo)} compareAtPrice={original} size={size} className={className} />;
  }
  return <Price price={product.price} compareAtPrice={product.compareAtPrice} size={size} className={className} />;
}

// Etiqueta "2x1" para la tarjeta (con % OFF el descuento ya se ve en el precio).
export function PromoBadge({ className }) {
  const { promo } = useCart();
  if (promo?.type !== "bundle") return null;
  return <span className={className}>{promo.bundle}</span>;
}

// Aviso de la promo debajo del precio, en la página del producto.
export function PromoNote({ className }) {
  const { promo } = useCart();
  if (!isPromoActive(promo)) return null;
  return (
    <p className={className}>
      <span className="mr-1.5 rounded-full bg-tinta px-2 py-0.5 text-[12px] font-bold text-crema">{promoLabel(promo)}</span>
      {promo.type === "bundle" ? `${promoDescription(promo)} Se aplica sola en el carrito.` : "En toda la tienda."}
    </p>
  );
}
