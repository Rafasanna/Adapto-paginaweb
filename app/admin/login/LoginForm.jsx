"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "No se pudo iniciar sesión.");
      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError.message);
      setLoading(false);
    }
  }

  const input =
    "mt-1.5 h-12 w-full rounded-xl border-2 border-linea bg-white px-3.5 text-[16px] outline-none transition-colors focus:border-teal-deep";

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <label className="block text-[14px] font-medium">
        Email
        <input
          type="email"
          autoComplete="username"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className={input}
        />
      </label>
      <label className="block text-[14px] font-medium">
        Contraseña
        <span className="relative block">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className={`${input} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-1.5 top-1/2 mt-[3px] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-gris hover:bg-crema hover:text-tinta"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      {error ? (
        <p role="alert" className="rounded-xl bg-pink-soft px-3.5 py-2.5 text-[14px] text-pink-ink">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-primary mt-1 w-full">
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
