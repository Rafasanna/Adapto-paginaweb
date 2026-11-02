import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({ price, compareAtPrice, className, size = "md" }) {
  const onSale = compareAtPrice && compareAtPrice > price;
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-semibold tabular-nums", size === "lg" ? "title text-[32px]" : "text-[17px]")}>{formatPrice(price)}</span>
      {onSale ? (
        <>
          <span className={cn("text-gris line-through tabular-nums", size === "lg" ? "text-[18px]" : "text-[14px]")}>
            <span className="sr-only">Antes </span>
            {formatPrice(compareAtPrice)}
          </span>
          <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[12px] font-bold text-teal-ink">
            -{Math.round((1 - price / compareAtPrice) * 100)}%
          </span>
        </>
      ) : null}
    </p>
  );
}
