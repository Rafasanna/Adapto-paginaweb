"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice, pluralize } from "@/lib/format";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/site/icons";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

export function CartDrawer() {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!cart.isOpen) return undefined;
    const previous = document.activeElement;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && cart.close();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [cart.isOpen, cart.close]);

  useEffect(() => {
    if (!cart.isOpen) setSent(false);
  }, [cart.isOpen]);

  if (!mounted || !cart.isOpen) return null;

  const message = buildOrderMessage(cart.items, { customerName: name });

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="absolute inset-0 animate-fade-in bg-tinta/40 backdrop-blur-[2px]"
        onClick={cart.close}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-titulo"
        className="absolute inset-y-0 right-0 flex w-full max-w-[440px] animate-slide-in flex-col bg-crema shadow-2xl outline-none"
      >
        <header className="flex items-center justify-between border-b-2 border-linea px-5 py-4">
          <div>
            <h2 id="carrito-titulo" className="title text-[22px]">
              Tu carrito
            </h2>
            <p className="text-[14px] text-gris">{cart.count ? pluralize(cart.count, "producto", "productos") : "Todavía está vacío"}</p>
          </div>
          <button type="button" onClick={cart.close} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white" aria-label="Cerrar carrito">
            <X className="h-5 w-5" />
          </button>
        </header>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-pink-dark bg-pink-soft">
              <ShoppingBag className="h-8 w-8 text-pink-ink" />
            </span>
            <p className="mt-5 text-[18px] font-semibold">Tu carrito está vacío</p>
            <p className="mt-1 text-[15px] text-gris">Elegí los productos que quieras y armá tu pedido.</p>
            <Link href="/productos" onClick={cart.close} className="btn-primary mt-6">
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y-2 divide-linea overflow-y-auto overscroll-contain px-5">
              {cart.items.map((item) => (
                <li key={item.slug} className="flex gap-4 py-4">
                  <Link href={`/productos/${item.slug}`} onClick={cart.close} className="paper relative h-[92px] w-[66px] shrink-0">
                    {item.image ? <Image src={item.image} alt="" fill sizes="66px" className="object-cover" /> : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {item.subcategoryName ? <p className="text-[12px] font-medium text-gris">{item.subcategoryName}</p> : null}
                        <Link href={`/productos/${item.slug}`} onClick={cart.close} className="line-clamp-2 text-[15px] font-semibold leading-snug hover:underline">
                          {item.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.slug)}
                        className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-gris hover:bg-white hover:text-tinta"
                        aria-label={`Quitar ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        max={cart.maxQuantity}
                        onChange={(value) => cart.setQuantity(item.slug, value)}
                        label={`Cantidad de ${item.name}`}
                      />
                      <div className="text-right leading-tight">
                        <p className="font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                        {item.quantity > 1 ? <p className="text-[12px] text-gris tabular-nums">{formatPrice(item.price)} c/u</p> : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t-2 border-linea bg-papel px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-medium">Total</span>
                <span className="title text-[26px] tabular-nums">{formatPrice(cart.total)}</span>
              </div>

              <label className="mt-3 block">
                <span className="text-[13px] font-medium text-gris">Tu nombre (opcional)</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="given-name"
                  maxLength={60}
                  placeholder="Para saber quién nos escribe"
                  className="mt-1 h-11 w-full rounded-xl border-2 border-linea bg-white px-3 text-[15px] outline-none transition-colors placeholder:text-gris/70 focus:border-purple"
                />
              </label>

              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSent(true)}
                className="btn-whatsapp mt-4 w-full text-[16px]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Enviar pedido por WhatsApp
              </a>
              <p className="mt-2.5 text-center text-[13px] leading-snug text-gris">
                Se abre WhatsApp con el detalle listo. Te respondemos con los datos de pago y te enviamos los archivos.
              </p>

              {sent ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-green-soft px-3 py-2.5 text-[14px]">
                  <span>¿Ya enviaste el pedido?</span>
                  <button
                    type="button"
                    onClick={() => {
                      cart.clear();
                      setSent(false);
                    }}
                    className="font-semibold underline underline-offset-2"
                  >
                    Vaciar carrito
                  </button>
                </div>
              ) : null}
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body
  );
}
