"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { colorClass } from "@/lib/colors";
import { useCart } from "@/components/shop/CartProvider";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./icons";

const navColors = ["purple", "pink", "green", "yellow", "teal"];

export function Header() {
  const pathname = usePathname();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

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
      className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-tinta/10 bg-white transition-colors hover:border-pink-dark hover:bg-pink-soft"
      aria-label={cart.count ? `Abrir carrito, ${cart.count} recursos` : "Abrir carrito"}
    >
      <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={2.2} />
      {cart.ready && cart.count > 0 ? (
        <span
          key={cart.bump}
          className="absolute -right-1.5 -top-1.5 grid h-[22px] min-w-[22px] animate-pop place-items-center rounded-full border-2 border-crema bg-pink px-1 text-[11px] font-bold tabular-nums text-tinta"
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
      className="bg-dots fixed inset-0 z-50 flex animate-fade-in flex-col overflow-y-auto bg-crema md:hidden"
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
            const color = colorClass(navColors[index % navColors.length]);
            return (
              <li key={item.href} className="animate-fade-in-up" style={{ animationDelay: `${50 + index * 50}ms` }}>
                <Link
                  href={item.href}
                  onClick={(event) => handleNav(event, item.href)}
                  className={cn("flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-[24px] font-semibold", color.border, color.soft)}
                >
                  <span className={cn("h-3 w-3 rounded-full", color.bg)} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-auto self-start">
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
        scrolled ? "bg-crema/90 shadow-[0_1px_0_theme(colors.linea)] backdrop-blur-md" : "bg-crema"
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[76px]">
        <Link href="/" onClick={(event) => handleNav(event, "/")} aria-label="ADAPTO, ir al inicio" className="shrink-0">
          <Logo variant="letters" priority className="h-auto w-[112px] lg:w-[132px]" alt="ADAPTO" />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[15px] font-medium">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={(event) => handleNav(event, item.href)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="link-underline pb-1"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
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

      {open && mounted ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
