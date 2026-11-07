"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Check, Loader2, RotateCcw } from "lucide-react";
import { uploadImages } from "@/lib/client/uploadImages";
import { cn } from "@/lib/utils";

async function saveSettings(body) {
  const response = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "No se pudo guardar.");
  return payload;
}

export function SiteSettings({ content, defaults, limits }) {
  return (
    <div>
      <h1 className="title text-[32px] sm:text-[38px]">Inicio y Nosotras</h1>
      <p className="mt-1 text-[15px] text-gris">Los cambios se ven en la página apenas guardás.</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
        <HomeText content={content} defaults={defaults} limits={limits} />
        <TeamPhotos team={content.team} defaults={defaults.team} />
      </div>
    </div>
  );
}

function HomeText({ content, defaults, limits }) {
  const router = useRouter();
  const [form, setForm] = useState({ welcome: content.welcome, who: content.who });
  const [state, setState] = useState(null); // { type, text }
  const dirty = form.welcome !== content.welcome || form.who !== content.who;

  async function submit(event) {
    event.preventDefault();
    setState({ type: "working" });
    try {
      await saveSettings({ home: form });
      setState({ type: "ok", text: "Guardado. Ya se ve en el inicio." });
      router.refresh();
    } catch (error) {
      setState({ type: "error", text: error.message });
    }
  }

  const field = "mt-1.5 w-full rounded-xl border-2 border-linea bg-white px-3.5 text-[16px] outline-none transition-colors focus:border-teal-deep";

  return (
    <form onSubmit={submit} className="rounded-[24px] bg-white p-4 sm:p-6">
      <h2 className="text-[18px] font-semibold">Frase del inicio</h2>
      <p className="mt-0.5 text-[14px] text-gris">El texto que aparece debajo del logo, al entrar a la página.</p>

      <label className="mt-4 block text-[14px] font-medium">
        Bienvenida
        <textarea
          value={form.welcome}
          onChange={(event) => setForm((current) => ({ ...current, welcome: event.target.value }))}
          maxLength={limits.welcome}
          rows={3}
          className={cn(field, "py-3 leading-relaxed")}
        />
        <span className="mt-1 block text-right text-[12px] font-normal text-gris tabular-nums">
          {form.welcome.length}/{limits.welcome}
        </span>
      </label>
      <label className="mt-1 block text-[14px] font-medium">
        Segunda línea <span className="font-normal text-gris">(opcional: si la dejás vacía, no se muestra)</span>
        <input
          value={form.who}
          onChange={(event) => setForm((current) => ({ ...current, who: event.target.value }))}
          maxLength={limits.who}
          className={cn(field, "h-12")}
        />
      </label>

      {/* Vista previa con el mismo estilo que el inicio */}
      <div className="bg-white mt-5 rounded-2xl border-2 border-linea px-4 py-6 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gris">Así se ve</p>
        <p className="mx-auto mt-3 max-w-[460px] text-[19px] font-semibold leading-snug">{form.welcome || "…"}</p>
        {form.who.trim() ? <p className="mt-2 text-[15px] text-teal-ink">{form.who}</p> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="submit" disabled={!dirty || state?.type === "working"} className="btn-primary">
          {state?.type === "working" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Guardar frase
        </button>
        <button
          type="button"
          onClick={() => setForm({ welcome: defaults.welcome, who: defaults.who })}
          className="btn-outline"
          disabled={form.welcome === defaults.welcome && form.who === defaults.who}
        >
          <RotateCcw className="h-4 w-4" />
          Texto original
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}

function TeamPhotos({ team, defaults }) {
  return (
    <section className="rounded-[24px] bg-white p-4 sm:p-6">
      <h2 className="text-[18px] font-semibold">Fotos de Nosotras</h2>
      <p className="mt-0.5 text-[14px] text-gris">Se usan en la página Nosotras y en el inicio. Conviene una foto de frente, con la cara centrada.</p>
      <ul className="mt-5 grid grid-cols-2 gap-4">
        {team.map((member) => (
          <MemberPhoto key={member.id} member={member} original={defaults.find((item) => item.id === member.id)?.photo} />
        ))}
      </ul>
    </section>
  );
}

function MemberPhoto({ member, original }) {
  const router = useRouter();
  const input = useRef(null);
  const [state, setState] = useState(null);
  const working = state?.type === "working";
  const isOriginal = member.photo === original;

  async function change(file) {
    if (!file) return;
    setState({ type: "working", text: "Subiendo…" });
    try {
      const [uploaded] = await uploadImages([file], { scope: "team", square: true });
      await saveSettings({ teamPhoto: { member: member.id, url: uploaded.url } });
      setState({ type: "ok", text: "Foto actualizada." });
      router.refresh();
    } catch (error) {
      setState({ type: "error", text: error.message });
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  async function restore() {
    setState({ type: "working", text: "Guardando…" });
    try {
      await saveSettings({ teamPhoto: { member: member.id, url: "" } });
      setState({ type: "ok", text: "Volvió la foto original." });
      router.refresh();
    } catch (error) {
      setState({ type: "error", text: error.message });
    }
  }

  return (
    <li className="text-center">
      <div className="relative mx-auto w-full max-w-[170px]">
        <div className="rounded-full border-[3px] border-teal bg-white p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={member.photo} alt={`Foto de ${member.name}`} className={cn("aspect-square w-full rounded-full object-cover", working && "opacity-40")} />
        </div>
        {working ? <Loader2 className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 animate-spin text-teal-deep" /> : null}
      </div>
      <p className="mt-3 text-[17px] font-semibold">{member.name}</p>
      <button type="button" onClick={() => input.current?.click()} disabled={working} className="btn-outline mt-2 min-h-[40px] px-4 text-[14px]">
        <Camera className="h-4 w-4" />
        Cambiar foto
      </button>
      {!isOriginal ? (
        <button type="button" onClick={restore} disabled={working} className="mt-2 block w-full text-[13px] text-gris underline underline-offset-2 hover:text-tinta">
          Volver a la original
        </button>
      ) : null}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => change(event.target.files?.[0])}
      />
      <Status state={state?.type === "working" ? null : state} compact />
    </li>
  );
}

function Status({ state, compact = false }) {
  if (!state || state.type === "working") return null;
  return (
    <p
      role={state.type === "error" ? "alert" : "status"}
      className={cn(
        "mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[14px]",
        compact && "justify-center text-[13px]",
        state.type === "error" ? "bg-pink-soft text-pink-ink" : "bg-teal-soft text-teal-ink"
      )}
    >
      {state.type === "ok" ? <Check className="h-4 w-4 shrink-0" /> : null}
      {state.text}
    </p>
  );
}
