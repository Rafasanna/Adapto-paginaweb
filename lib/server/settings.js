import "server-only";
import { cache } from "react";
import { site } from "@/config/site";
import { getSql, isDatabaseConfigured } from "./db";
import { PublicApiError } from "./http";
import { isOwnImage } from "./cloudinary";
import { ANNOUNCEMENT_COLORS, ANNOUNCEMENT_MAX, HERO_VEILS, isHexColor } from "@/lib/banner";
import { NO_PROMO, normalizePromo, PROMO_BUNDLES, PROMO_PERCENT } from "@/lib/promo";

// Ajustes del sitio editables desde el admin (tabla site_settings):
//   home → frase del banner de inicio { welcome, who }
//   team → fotos de Nosotras { azu: url, jaz: url }
//   announcement → barra de anuncio arriba del header { enabled, text, color }
//   hero → foto de fondo del banner de inicio { image, veil }
//   promo → promoción para toda la tienda { type: none|percent|bundle, percent, bundle }
// Si no hay base o falta un valor, se usa lo de config/site.js.

const LIMITS = { welcome: 220, who: 160, announcement: ANNOUNCEMENT_MAX };

function defaults() {
  return {
    welcome: site.welcome.closing,
    who: site.welcome.who,
    team: site.team.map((member) => ({ ...member })),
    announcement: { enabled: false, text: "", color: ANNOUNCEMENT_COLORS[0].value },
    hero: { image: "", veil: "medio" },
    promo: { ...NO_PROMO }
  };
}

async function readRaw() {
  const sql = getSql();
  const rows = await sql`select key, value from site_settings where key in ('home', 'team', 'announcement', 'hero', 'promo')`;
  return Object.fromEntries(rows.map((row) => [row.key, row.value || {}]));
}

// Para la tienda (y el admin): siempre devuelve algo usable.
export const getSiteContent = cache(async () => {
  const content = defaults();
  if (!isDatabaseConfigured()) return content;
  try {
    const raw = await readRaw();
    if (raw.home?.welcome) content.welcome = raw.home.welcome;
    // La segunda línea es opcional: si se guardó vacía, no se muestra (no vuelve al texto original)
    if (raw.home && typeof raw.home.who === "string") content.who = raw.home.who;
    content.team = content.team.map((member) => (raw.team?.[member.id] ? { ...member, photo: raw.team[member.id] } : member));
    if (raw.announcement) {
      const { enabled, text, color } = raw.announcement;
      content.announcement = {
        enabled: Boolean(enabled) && Boolean(text),
        text: typeof text === "string" ? text : "",
        color: isHexColor(color) ? color : content.announcement.color
      };
    }
    if (raw.promo) content.promo = normalizePromo(raw.promo);
    if (raw.hero) {
      content.hero = {
        image: typeof raw.hero.image === "string" ? raw.hero.image : "",
        veil: HERO_VEILS.some((veil) => veil.id === raw.hero.veil) ? raw.hero.veil : content.hero.veil
      };
    }
  } catch (error) {
    console.error("[settings] No se pudieron leer los ajustes:", error?.message);
  }
  return content;
});

export async function updateHomeText(input) {
  const welcome = clean(input?.welcome, LIMITS.welcome, "La frase de bienvenida");
  const who = clean(input?.who, LIMITS.who, "La segunda línea", { optional: true });
  await upsert("home", { welcome, who });
  return { welcome, who };
}

// url vacío = volver a la foto original (la de config/site.js)
export async function updateTeamPhoto(input) {
  const memberId = String(input?.member || "");
  if (!site.team.some((member) => member.id === memberId)) {
    throw new PublicApiError("INVALID_INPUT", "Integrante no válida.", { status: 400 });
  }
  const url = String(input?.url || "");
  if (url && !isOwnImage(url, "team")) {
    throw new PublicApiError("INVALID_INPUT", "La foto no es válida. Volvé a subirla.", { status: 400 });
  }
  const sql = getSql();
  const [current] = await sql`select value from site_settings where key = 'team'`;
  const value = { ...(current?.value || {}) };
  if (url) value[memberId] = url;
  else delete value[memberId];
  await upsert("team", value);
  return { member: memberId, url: url || null };
}

// Barra de anuncio: se puede apagar sin perder la frase y el color.
export async function updateAnnouncement(input) {
  const enabled = input?.enabled === true;
  const text = clean(input?.text, LIMITS.announcement, "La frase de la barra", { optional: !enabled });
  const color = String(input?.color || "");
  if (!isHexColor(color)) throw new PublicApiError("INVALID_INPUT", "El color no es válido.", { status: 400 });
  const value = { enabled, text, color: color.toUpperCase() };
  await upsert("announcement", value);
  return value;
}

// Fondo del inicio: image vacío = sin foto (fondo blanco, como siempre).
export async function updateHero(input) {
  const image = String(input?.image || "");
  if (image && !isOwnImage(image, "hero")) {
    throw new PublicApiError("INVALID_INPUT", "La foto no es válida. Volvé a subirla.", { status: 400 });
  }
  const veil = String(input?.veil || "");
  if (!HERO_VEILS.some((item) => item.id === veil)) {
    throw new PublicApiError("INVALID_INPUT", "La intensidad del velo no es válida.", { status: 400 });
  }
  const value = { image, veil };
  await upsert("hero", value);
  return value;
}

// Promoción para toda la tienda. Se guardan el % y el NxM aunque esté apagada, para volver a usarlos.
export async function updatePromo(input) {
  const type = String(input?.type || "");
  if (!["none", "percent", "bundle"].includes(type)) {
    throw new PublicApiError("INVALID_INPUT", "Elegí un tipo de promoción.", { status: 400 });
  }
  const percent = Number(input?.percent);
  if (type === "percent" && !(Number.isInteger(percent) && percent >= PROMO_PERCENT.min && percent <= PROMO_PERCENT.max)) {
    throw new PublicApiError("INVALID_INPUT", `El descuento tiene que ser un número entero entre ${PROMO_PERCENT.min} y ${PROMO_PERCENT.max}.`, { status: 400 });
  }
  if (type === "bundle" && !PROMO_BUNDLES.some((item) => item.id === input?.bundle)) {
    throw new PublicApiError("INVALID_INPUT", "Elegí 2x1, 3x2 o 4x3.", { status: 400 });
  }
  const value = normalizePromo({ type, percent, bundle: input?.bundle });
  await upsert("promo", value);
  return value;
}

async function upsert(key, value) {
  const sql = getSql();
  await sql`
    insert into site_settings (key, value, updated_at)
    values (${key}, ${JSON.stringify(value)}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

function clean(value, max, label, { optional = false } = {}) {
  const text = String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!text && !optional) throw new PublicApiError("INVALID_INPUT", `${label} no puede quedar vacía.`, { status: 400 });
  if (text.length > max) throw new PublicApiError("INVALID_INPUT", `${label} puede tener hasta ${max} caracteres.`, { status: 400 });
  return text;
}

export const SETTINGS_LIMITS = LIMITS;
