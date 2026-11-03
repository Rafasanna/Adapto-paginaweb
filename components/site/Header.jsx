"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/shop/CartProvider";
import { Logo } from "./Logo";
import { HeaderSearch } from "./HeaderSearch";
import { WhatsAppIcon } from "./icons";


export function Header() {
  const pathname = usePathname();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href) => {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Si el destino es la página actual (ej. "/#como-comprar" estando en el inicio), scrollea a mano.
  const handleNav = (event, href) => {
    setOpen(false);
    const [rawPath, hash] = href.split("#");
    const path = rawPath || "/";
    if (path !== pathname) return;
    event.preventDefault();
    document.body.style.overflow = "";
    requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash) : null;
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const cartButton = (
    <button
      type="button"
      onClick={cart.open}
      className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-transparent bg-crema transition-colors hover:border-teal hover:bg-teal-soft"
      aria-label={cart.count ? `Abrir carrito, ${cart.count} productos` : "Abrir carrito"}
    >
      <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={2.2} />
      {cart.ready && cart.count > 0 ? (
        <span
          key={cart.bump}
          className="absolute -right-1.5 -top-1.5 grid h-[22px] min-w-[22px] animate-pop place-items-center rounded-full border-2 border-white bg-teal-deep px-1 text-[11px] font-bold tabular-nums text-white"
        >
          {cart.count > 99 ? "99+" : cart.count}
        </span>
      ) : null}
    </button>
  );

  const mobileMenu = (
    <div
      id="menu-movil"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      className="fixed inset-0 z-50 flex animate-fade-in flex-col overflow-y-auto bg-crema md:hidden"
    >
      <div className="container-site flex h-16 shrink-0 items-center justify-between">
        <Link href="/" onClick={(event) => handleNav(event, "/")} aria-label="ADAPTO, ir al inicio">
          <Logo variant="letters" className="h-auto w-[118px]" alt="" />
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="-mr-2 grid h-11 w-11 place-items-center" aria-label="Cerrar menú">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav aria-label="Principal" className="container-site flex flex-1 flex-col pb-10 pt-8">
        <ul className="grid gap-2.5">
          {site.nav.map((item, index) => {
            return (
              <li key={item.href} className="animate-fade-in-up" style={{ animationDelay: `${50 + index * 50}ms` }}>
                <Link
                  href={item.href}
                  onClick={(event) => handleNav(event, item.href)}
                  className="flex items-center gap-3 rounded-2xl border-2 border-linea bg-white px-4 py-3.5 text-[24px] font-semibold"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-teal" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <a href={whatsappUrl(site.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-auto self-start">
          <WhatsAppIcon className="h-5 w-5" />
          Escribinos
        </a>
      </nav>
    </div>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow] duration-300",
        // Blanco, para separarse del crema de la página
        scrolled ? "bg-white/95 shadow-[0_6px_20px_-12px_rgb(46_42_39/0.25)] backdrop-blur-md" : "bg-white"
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[76px]">
        {/* Hover: el logo crece un poco y se balancea, como saludando */}
        <Link href="/" onClick={(event) => handleNav(event, "/")} aria-label="ADAPTO, ir al inicio" className="group shrink-0 rounded-md">
          <Logo
            variant="letters"
            priority
            className="h-auto w-[112px] origin-center transition-transform duration-300 ease-out group-hover:animate-logo-hello group-focus-visible:animate-logo-hello lg:w-[132px]"
            alt="ADAPTO"
          />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-6 text-[15px] font-medium xl:gap-7">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={(event) => handleNav(event, item.href)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="link-underline rounded-sm pb-1"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Buscador: campo visible en pantallas grandes, lupa en el resto */}
          <Suspense fallback={<div className="hidden h-11 w-[230px] lg:block" />}>
            <HeaderSearch className="hidden w-[230px] lg:block xl:w-[270px]" inputClassName="bg-crema border-transparent focus:bg-white" />
          </Suspense>
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full border-2 transition-colors lg:hidden",
              searchOpen ? "border-teal bg-teal-soft" : "border-transparent bg-crema hover:border-teal"
            )}
            aria-label={searchOpen ? "Cerrar buscador" : "Buscar productos"}
            aria-expanded={searchOpen}
            aria-controls="buscador-movil"
          >
            {searchOpen ? <X className="h-[19px] w-[19px]" /> : <Search className="h-[19px] w-[19px]" strokeWidth={2.2} />}
          </button>
          {cartButton}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-mr-2 grid h-11 w-11 place-items-center md:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="menu-movil"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div id="buscador-movil" className="container-site animate-fade-in pb-3 lg:hidden">
          <Suspense fallback={null}>
            <HeaderSearch autoFocus onSubmitted={() => setSearchOpen(false)} inputClassName="bg-crema border-transparent focus:bg-white" />
          </Suspense>
        </div>
      ) : null}

      {/* Franja con los 5 colores del logo */}
      <div className="flex h-[4px]" aria-hidden="true">
        <span className="flex-1 bg-purple" />
        <span className="flex-1 bg-pink" />
        <span className="flex-1 bg-green" />
        <span className="flex-1 bg-yellow" />
        <span className="flex-1 bg-teal" />
      </div>

      {open && mounted ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
