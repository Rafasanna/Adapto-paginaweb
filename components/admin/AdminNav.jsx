"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sections = [
  { href: "/admin", label: "Productos", match: (path) => path === "/admin" || path.startsWith("/admin/productos") },
  { href: "/admin/sitio", label: "Inicio y Nosotras", match: (path) => path.startsWith("/admin/sitio") }
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones del admin" className="mx-auto flex max-w-[1100px] gap-1 px-4 sm:px-6">
      {sections.map((section) => {
        const active = section.match(pathname);
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-[2px] border-b-[3px] px-3 pb-2.5 pt-1 text-[15px] font-semibold transition-colors",
              active ? "border-teal-deep text-tinta" : "border-transparent text-gris hover:text-tinta"
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
