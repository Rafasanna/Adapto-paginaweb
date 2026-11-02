"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Galería del detalle: las páginas del documento pasan solas (se pausa al tocar),
// con flechas, deslizamiento en mobile y miniaturas.
export function ProductGallery({ previews = [], name, color = "bg-crema" }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const touch = useRef(null);
  const count = previews.length;

  const go = useCallback((next) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing || count < 2) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % count), 3200);
    return () => clearInterval(timer);
  }, [playing, count]);

  const manual = (next) => {
    setPlaying(false);
    go(next);
  };

  if (!count) {
    return <div className={cn("grid aspect-[4/5] place-items-center rounded-[28px] text-gris", color)}>Sin vista previa</div>;
  }

  return (
    <div>
      <div
        className={cn("relative overflow-hidden rounded-[28px] px-[16%] py-[9%]", color)}
        onTouchStart={(event) => (touch.current = event.touches[0].clientX)}
        onTouchEnd={(event) => {
          if (touch.current == null) return;
          const delta = event.changedTouches[0].clientX - touch.current;
          if (Math.abs(delta) > 40) manual(index + (delta < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        <div className="paper relative mx-auto aspect-[210/297] w-full max-w-[420px]" aria-live="polite">
          {previews.map((page, pageIndex) => (
            <Image
              key={page.url}
              src={page.url}
              alt={page.alt ? `${name} · ${page.alt}` : `${name} · página ${pageIndex + 1}`}
              fill
              priority={pageIndex === 0}
              sizes="(min-width: 1024px) 34vw, 80vw"
              className={cn("object-cover transition-opacity duration-500", pageIndex === index ? "opacity-100" : "opacity-0")}
              aria-hidden={pageIndex !== index}
            />
          ))}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => manual(index - 1)}
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-sm hover:bg-white"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => manual(index + 1)}
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-sm hover:bg-white"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 py-1 pl-3 pr-1 text-[13px] font-medium shadow-sm">
              <span className="tabular-nums">
                {index + 1} / {count}
              </span>
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                className="grid h-7 w-7 place-items-center rounded-full hover:bg-crema"
                aria-label={playing ? "Pausar" : "Reproducir"}
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="scrollbar-none mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {previews.map((page, pageIndex) => (
            <button
              key={page.url}
              type="button"
              onClick={() => manual(pageIndex)}
              className={cn(
                "paper relative aspect-[210/297] w-[62px] shrink-0 transition-[opacity,box-shadow] duration-200",
                pageIndex === index ? "opacity-100 ring-2 ring-tinta" : "opacity-60 hover:opacity-100"
              )}
              aria-label={`Ver página ${pageIndex + 1}`}
              aria-current={pageIndex === index ? "true" : undefined}
            >
              <Image src={page.url} alt="" fill sizes="62px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
