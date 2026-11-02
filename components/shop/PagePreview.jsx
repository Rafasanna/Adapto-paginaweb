"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Carrusel chiquito que va pasando solo las páginas del documento (la 1ra es la portada).
// · Solo corre cuando la tarjeta está en pantalla.
// · Cada tarjeta arranca con un desfase para que no cambien todas a la vez.
// · Con "reducir movimiento" se queda en la portada.
export function PagePreview({ previews = [], name, interval = 2600, offset = 0, sizes = "(min-width: 1024px) 22vw, 45vw", className, priority = false }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const pages = previews.length ? previews : [];
  const count = pages.length;

  useEffect(() => {
    const element = ref.current;
    if (!element || count < 2) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    if (!visible || count < 2) return undefined;
    let timer;
    const start = setTimeout(() => {
      setIndex((value) => (value + 1) % count);
      timer = setInterval(() => setIndex((value) => (value + 1) % count), interval);
    }, interval + (offset % 4) * 450);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [visible, count, interval, offset]);

  return (
    <div ref={ref} className={cn("paper relative aspect-[210/297] w-full", className)}>
      {count === 0 ? (
        <div className="grid h-full place-items-center bg-crema text-[13px] text-gris">Sin vista previa</div>
      ) : (
        pages.map((page, pageIndex) => (
          <Image
            key={page.url}
            src={page.url}
            alt={pageIndex === 0 ? `Portada de ${name}` : ""}
            fill
            sizes={sizes}
            priority={priority && pageIndex === 0}
            className={cn(
              "object-cover transition-opacity duration-700 ease-out",
              pageIndex === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))
      )}

      {count > 1 ? (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-tinta/55 px-1.5 py-1 backdrop-blur-sm" aria-hidden="true">
          {pages.map((page, dotIndex) => (
            <span
              key={page.url}
              className={cn("h-1.5 rounded-full bg-white transition-all duration-300", dotIndex === index ? "w-3.5" : "w-1.5 opacity-60")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
