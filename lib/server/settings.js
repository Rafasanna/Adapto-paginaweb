import "server-only";
import { cache } from "react";
import { site } from "@/config/site";
import { getSql, isDatabaseConfigured } from "./db";
import { PublicApiError } from "./http";
import { isOwnImage } from "./cloudinary";

// Ajustes del sitio editables desde el admin (tabla site_settings):
//   home → frase del banner de inicio { welcome, who }
//   team → fotos de Nosotras { azu: url, jaz: url }
// Si no hay base o falta un valor, se usa lo de config/site.js.

const LIMITS = { welcome: 220, who: 160 };

function defaults() {
  return {
    welcome: site.welcome.closing,
    who: site.welcome.who,
    team: site.team.map((member) => ({ ...member }))
  };
}

async function readRaw() {
  const sql = getSql();
  const rows = await sql`select key, value from site_settings where key in ('home', 'team')`;
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
