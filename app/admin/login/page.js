import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/auth";
import { isDatabaseConfigured } from "@/lib/server/db";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const ready = isDatabaseConfigured() && Boolean(process.env.AUTH_SECRET);

  return (
    <main className="bg-white grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-[400px] rounded-[28px] bg-white p-6 shadow-paper sm:p-8">
        <Logo variant="letters" className="h-auto w-[130px]" alt="ADAPTO" />
        <h1 className="title mt-6 text-[28px]">Panel de administración</h1>
        <p className="mt-1 text-[15px] text-gris">Ingresá para cargar y editar productos.</p>
        {ready ? (
          <LoginForm />
        ) : (
          <p className="mt-6 rounded-2xl bg-yellow-soft px-4 py-3 text-[14px] text-yellow-ink">
            Falta configurar la base de datos o AUTH_SECRET en el servidor.
          </p>
        )}
      </section>
    </main>
  );
}
