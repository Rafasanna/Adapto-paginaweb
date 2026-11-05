import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getAdminSession } from "@/lib/server/auth";
import { Logo } from "@/components/site/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";

// Todo lo que está dentro de app/admin/(panel)/ queda protegido:
// sin sesión válida redirige a /admin/login (se verifica en el servidor, en cada request).
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <header className="sticky top-0 z-30 border-b-2 border-linea bg-white">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5" aria-label="Admin, productos">
            <Logo variant="letters" className="h-auto w-[92px]" alt="ADAPTO" />
            <span className="rounded-full bg-teal-soft px-2.5 py-0.5 text-[12px] font-semibold text-teal-ink">Admin</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-[14px] font-medium">
            <a
              href="/productos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 hover:bg-crema"
            >
              <span className="hidden sm:inline">Ver tienda</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <span className="hidden max-w-[180px] truncate px-2 text-gris md:inline">{session.user.name}</span>
            <LogoutButton />
          </nav>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-[1100px] px-4 pb-28 pt-6 sm:px-6 sm:pt-8">{children}</main>
    </>
  );
}
