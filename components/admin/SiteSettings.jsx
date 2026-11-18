"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Check, ImagePlus, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { uploadImages } from "@/lib/client/uploadImages";
import { ANNOUNCEMENT_COLORS, HERO_VEILS, isHexColor, textColorFor, veilClass } from "@/lib/banner";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";

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
        <AnnouncementSettings announcement={content.announcement} limit={limits.announcement} />
        <HeroBackground hero={content.hero} welcome={content.welcome} />
        <HomeText content={content} defaults={defaults} limits={limits} />
        <TeamPhotos team={content.team} defaults={defaults.team} />
      </div>
    </div>
  );
}

const fieldClass = "mt-1.5 w-full rounded-xl border-2 border-linea bg-white px-3.5 text-[16px] outline-none transition-colors focus:border-teal-deep";

// Barra de anuncio arriba del header: prender/apagar, frase y color.
function AnnouncementSettings({ announcement, limit }) {
  const router = useRouter();
  const [form, setForm] = useState(announcement);
  const [state, setState] = useState(null);
  const dirty = form.enabled !== announcement.enabled || form.text !== announcement.text || form.color.toUpperCase() !== announcement.color.toUpperCase();
  const isPreset = ANNOUNCEMENT_COLORS.some((item) => item.value.toUpperCase() === form.color.toUpperCase());
  const needsText = form.enabled && !form.text.trim();

  async function submit(event) {
    event.preventDefault();
    setState({ type: "working" });
    try {
      const { announcement: saved } = await saveSettings({ announcement: form });
      setForm(saved);
      setState({ type: "ok", text: saved.enabled ? "Guardado. La barra ya se ve en la página." : "Guardado. La barra está apagada." });
      router.refresh();
    } catch (error) {
      setState({ type: "error", text: error.message });
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[24px] bg-white p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">Barra de anuncio</h2>
          <p className="mt-0.5 text-[14px] text-gris">Una franja arriba de todo, en todas las páginas. Ideal para promos o avisos.</p>
        </div>
        <Switch
          checked={form.enabled}
          onChange={(enabled) => setForm((current) => ({ ...current, enabled }))}
          label="Mostrar la barra"
        />
      </div>

      <label className="mt-4 block text-[14px] font-medium">
        Frase
        <input
          value={form.text}
          onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
          maxLength={limit}
          placeholder="Ej.: 20% OFF en guías de seguimiento hasta el domingo"
          className={cn(fieldClass, "h-12")}
        />
        <span className="mt-1 block text-right text-[12px] font-normal text-gris tabular-nums">
          {form.text.length}/{limit}
        </span>
      </label>

      <fieldset className="mt-1">
        <legend className="text-[14px] font-medium">Color</legend>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {ANNOUNCEMENT_COLORS.map((item) => {
            const selected = item.value.toUpperCase() === form.color.toUpperCase();
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setForm((current) => ({ ...current, color: item.value }))}
                aria-pressed={selected}
                aria-label={item.name}
                title={item.name}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full border-2 border-black/10 transition-transform hover:scale-105",
                  selected && "ring-2 ring-tinta ring-offset-2"
                )}
                style={{ backgroundColor: item.value, color: textColorFor(item.value) }}
              >
                {selected ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
          <label
            className={cn(
              "relative flex h-9 cursor-pointer items-center gap-2 rounded-full border-2 border-linea pl-1 pr-3 text-[13px] font-medium",
              !isPreset && "ring-2 ring-tinta ring-offset-2"
            )}
            title="Elegir otro color"
          >
            <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: isPreset ? "conic-gradient(#CB6CE6, #FF66C4, #FFDE59, #B1D782, #9AD7C4, #CB6CE6)" : form.color }} />
            Otro
            <input
              type="color"
              value={isHexColor(form.color) ? form.color.toLowerCase() : "#2e2a27"}
              onChange={(event) => setForm((current) => ({ ...current, color: event.target.value.toUpperCase() }))}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Elegir otro color"
            />
          </label>
        </div>
      </fieldset>

      {/* Vista previa con el mismo estilo que la barra real */}
      <div className="mt-5 overflow-hidden rounded-2xl border-2 border-linea">
        <p className="bg-papel px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-gris">Así se ve</p>
        <div
          className={cn("px-4 py-2 text-center text-[13px] font-medium leading-snug sm:text-[14px]", !form.enabled && "opacity-40")}
          style={{ backgroundColor: form.color, color: textColorFor(form.color) }}
        >
          {form.text || "Escribí la frase de la barra"}
        </div>
        {!form.enabled ? <p className="bg-papel px-4 py-2 text-center text-[13px] text-gris">Apagada: no se muestra en la página.</p> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="submit" disabled={!dirty || needsText || state?.type === "working"} className="btn-primary">
          {state?.type === "working" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Guardar barra
        </button>
        {needsText ? <span className="text-[13px] text-gris">Escribí una frase para poder prenderla.</span> : null}
      </div>
      <Status state={state} />
    </form>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex shrink-0 items-center gap-2 rounded-full text-[13px] font-medium"
    >
      <span className={cn("relative h-7 w-12 rounded-full border-2 transition-colors", checked ? "border-teal-dark bg-teal" : "border-linea bg-crema")}>
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left]",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
      <span className="w-[52px] text-left">{checked ? "Activa" : "Apagada"}</span>
    </button>
  );
}

// Foto de fondo del banner de inicio (donde está el logo) + velo blanco para que se lea.
function HeroBackground({ hero, welcome }) {
  const router = useRouter();
  const input = useRef(null);
  const [form, setForm] = useState(hero);
  const [state, setState] = useState(null);
  const working = state?.type === "working";
  const dirty = form.image !== hero.image || form.veil !== hero.veil;

  async function upload(file) {
    if (!file) return;
    setState({ type: "working", text: "Subiendo foto…" });
    try {
      const [uploaded] = await uploadImages([file], { scope: "hero", maxDimension: 2400 });
      setForm((current) => ({ ...current, image: uploaded.url }));
      setState({ type: "ok", text: "Foto lista. Revisá cómo queda y guardá." });
    } catch (error) {
      setState({ type: "error", text: error.message });
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  async function save() {
    setState({ type: "working", text: "Guardando…" });
    try {
      await saveSettings({ hero: form });
      setState({ type: "ok", text: form.image ? "Guardado. Ya se ve en el inicio." : "Guardado. El inicio vuelve a tener fondo blanco." });
      router.refresh();
    } catch (error) {
      setState({ type: "error", text: error.message });
    }
  }

  return (
    <section className="rounded-[24px] bg-white p-4 sm:p-6">
      <h2 className="text-[18px] font-semibold">Fondo del inicio</h2>
      <p className="mt-0.5 text-[14px] text-gris">
        Una foto detrás del logo. Conviene horizontal y sin texto; en celular se ve la parte del centro.
      </p>

      {/* Vista previa del banner */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-linea bg-white">
        {form.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className={cn("absolute inset-0", veilClass(form.veil))} />
          </>
        ) : null}
        <div className={cn("relative flex flex-col items-center px-6 py-9 text-center", working && "opacity-50")}>
          <Logo className="h-auto w-full max-w-[220px]" />
          <p className="mt-4 max-w-[320px] text-[13px] font-semibold leading-snug">{welcome}</p>
          <span className="btn-primary pointer-events-none mt-4 min-h-[32px] px-4 text-[12px]">Ver productos</span>
        </div>
        {working ? <Loader2 className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 animate-spin text-teal-deep" /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={working} className="btn-outline min-h-[40px] px-4 text-[14px]">
          <ImagePlus className="h-4 w-4" />
          {form.image ? "Cambiar foto" : "Subir foto"}
        </button>
        {form.image ? (
          <button type="button" onClick={() => setForm((current) => ({ ...current, image: "" }))} disabled={working} className="btn-outline min-h-[40px] px-4 text-[14px]">
            <Trash2 className="h-4 w-4" />
            Quitar foto
          </button>
        ) : null}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => upload(event.target.files?.[0])}
      />

      {form.image ? (
        <fieldset className="mt-4">
          <legend className="text-[14px] font-medium">Velo blanco sobre la foto</legend>
          <p className="text-[13px] text-gris">Más fuerte = el logo y el texto se leen mejor.</p>
          <div className="mt-2 inline-flex rounded-full border-2 border-linea bg-crema p-1">
            {HERO_VEILS.map((veil) => (
              <button
                key={veil.id}
                type="button"
                onClick={() => setForm((current) => ({ ...current, veil: veil.id }))}
                aria-pressed={form.veil === veil.id}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[14px] font-medium transition-colors",
                  form.veil === veil.id ? "bg-white text-tinta shadow-sm" : "text-gris hover:text-tinta"
                )}
              >
                {veil.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={!dirty || working} className="btn-primary">
          {working && state?.text === "Guardando…" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Guardar fondo
        </button>
        {dirty && !working ? <span className="text-[13px] text-gris">Hay cambios sin guardar.</span> : null}
      </div>
      <Status state={state} />
    </section>
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

  const field = fieldClass;

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
