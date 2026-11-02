"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/site/icons";
import { QuantityStepper } from "./QuantityStepper";
import { toCartItem, useCart } from "./CartProvider";

export function AddToCart({ product, subcategoryName }) {
  const { addItem, maxQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const item = toCartItem(product, subcategoryName);
  const directMessage = buildOrderMessage([{ ...item, quantity }]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} max={maxQuantity} />
        <button
          type="button"
          onClick={() => {
            addItem(item, quantity);
            setQuantity(1);
          }}
          className="btn-primary min-h-[50px] flex-1 whitespace-nowrap px-4 text-[16px] sm:flex-none sm:px-6"
        >
          <ShoppingBag className="hidden h-5 w-5 min-[400px]:block" strokeWidth={2.2} />
          Agregar al carrito
        </button>
      </div>
      {quantity > 1 ? (
        <p className="mt-2 text-[14px] text-gris">
          {quantity} unidades · <span className="font-semibold text-tinta tabular-nums">{formatPrice(product.price * quantity)}</span>
        </p>
      ) : null}
      <a
        href={whatsappUrl(directMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium underline decoration-teal decoration-2 underline-offset-4 hover:decoration-tinta"
      >
        <WhatsAppIcon className="h-4 w-4 text-teal-ink" />
        Pedir solo este producto por WhatsApp
      </a>
    </div>
  );
}
