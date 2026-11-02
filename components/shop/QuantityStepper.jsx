"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({ value, onChange, min = 1, max = 99, size = "md", label = "Cantidad", className }) {
  const small = size === "sm";
  const button = cn(
    "grid place-items-center rounded-full text-tinta transition-colors hover:bg-crema disabled:opacity-35 disabled:hover:bg-transparent",
    small ? "h-8 w-8" : "h-11 w-11"
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-full border-2 border-linea bg-white",
        small ? "h-9 p-0.5" : "h-[50px] p-0.5",
        className
      )}
    >
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Restar una unidad">
        <Minus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.5} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = parseInt(event.target.value, 10);
          if (!Number.isNaN(next)) onChange(Math.max(min, Math.min(max, next)));
        }}
        aria-label={label}
        className={cn(
          "bg-transparent text-center font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          small ? "w-7 text-[14px]" : "w-10 text-[17px]"
        )}
      />
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Sumar una unidad">
        <Plus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.5} />
      </button>
    </div>
  );
}
