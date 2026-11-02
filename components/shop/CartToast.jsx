"use client";

import { Check } from "lucide-react";
import { useCart } from "./CartProvider";

// Aviso corto al agregar un producto, con acceso directo al carrito.
export function CartToast() {
  const { toast, open, dismissToast, isOpen } = useCart();
  if (!toast || isOpen) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] left-1/2 sm:bottom-6 z-[55] flex w-[calc(100%-2rem)] max-w-[420px] animate-toast-in items-center gap-3 rounded-2xl border-2 border-tinta bg-tinta py-2.5 pl-3 pr-2 text-crema shadow-xl"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal text-tinta">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
      <span className="flex-1 text-[15px] font-medium">{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          dismissToast();
          open();
        }}
        className="rounded-full bg-crema px-4 py-2 text-[14px] font-semibold text-tinta hover:bg-teal"
      >
        Ver carrito
      </button>
    </div>
  );
}
