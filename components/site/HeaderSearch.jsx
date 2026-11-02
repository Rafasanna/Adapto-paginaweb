"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PRODUCTS_PATH = "/productos";

// Buscador del header.
// · En /productos filtra mientras escribís (actualiza ?q= sin perder los otros filtros).
// · En cualquier otra página, al apretar Enter lleva a /productos?q=...
export function HeaderSearch({ className, inputClassName, autoFocus = false, onSubmitted }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const onProducts = pathname === PRODUCTS_PATH;
  const urlQuery = onProducts ? params.get("q") || "" : "";
  const [value, setValue] = useState(urlQuery);
  const inputRef = useRef(null);
  const typing = useRef(false);
  const id = useId();

  // Si la URL cambia desde afuera (ej. "Limpiar filtros"), el campo se actualiza
  useEffect(() => {
    if (!typing.current) setValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const buildUrl = (text) => {
    const next = new URLSearchParams(onProducts ? params.toString() : "");
    if (text.trim()) next.set("q", text.trim());
    else next.delete("q");
    const search = next.toString();
    return search ? `${PRODUCTS_PATH}?${search}` : PRODUCTS_PATH;
  };

  // Búsqueda en vivo dentro de /productos
  useEffect(() => {
    if (!onProducts || !typing.current) return undefined;
    const timer = setTimeout(() => {
      router.replace(buildUrl(value), { scroll: false });
      typing.current = false;
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, onProducts]);

  const submit = (event) => {
    event.preventDefault();
    typing.current = false;
    if (onProducts) router.replace(buildUrl(value), { scroll: false });
    else router.push(buildUrl(value));
    inputRef.current?.blur();
    onSubmitted?.();
  };

  return (
    <form role="search" onSubmit={submit} className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Buscar productos
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gris" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(event) => {
          typing.current = true;
          setValue(event.target.value);
        }}
        placeholder="Buscar productos…"
        className={cn(
          "h-11 w-full rounded-full border-2 border-linea bg-white pl-10 pr-10 text-[15px] outline-none transition-colors placeholder:text-gris/80 focus:border-teal-deep [&::-webkit-search-cancel-button]:hidden",
          inputClassName
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            typing.current = true;
            setValue("");
            inputRef.current?.focus();
          }}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full hover:bg-crema"
          aria-label="Borrar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </form>
  );
}
