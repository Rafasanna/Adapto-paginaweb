"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Aparición suave cuando el bloque entra en pantalla. Sin JS el contenido se ve igual.
export function Reveal({ as: Tag = "div", delay = 0, className, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    element.classList.add("reveal");
    if (!("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={cn(className)} style={delay ? { "--reveal-delay": `${delay}ms` } : undefined} {...props}>
      {children}
    </Tag>
  );
}
