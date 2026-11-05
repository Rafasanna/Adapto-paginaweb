import "server-only";
import crypto from "node:crypto";
import { getSql } from "./db";
import { getAuthSecret } from "./auth";
import { PublicApiError } from "./http";

// Límite de intentos guardado en la base (tabla admin_login_attempts).
// Se usa para el login del admin: 5 intentos por email y 20 por IP cada 15 minutos.
// Las claves (IP, email) se guardan hasheadas con AUTH_SECRET, nunca en claro.
// Superado el máximo dentro de la ventana, la clave queda bloqueada LOCK_MINUTES.
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;

export function buildThrottleKey(value, max) {
  return { key: hashKey(value), max };
}

export function buildLoginKeys({ ip, email }) {
  const normalizedEmail = String(email || "").trim().toLowerCase().slice(0, 254) || "missing";
  return [buildThrottleKey(`ip:${ip}`, 20), buildThrottleKey(`email:${normalizedEmail}`, 5)];
}

export async function assertAllowed(keys, message = "Demasiados intentos. Esperá unos minutos antes de volver a intentar.") {
  const sql = getSql();
  const hashes = keys.map((item) => item.key);
  const [row] = await sql`
    select ceil(extract(epoch from max(locked_until) - now()))::int as retry_after
    from admin_login_attempts
    where key_hash = any(${hashes}) and locked_until > now()
  `;
  const retryAfter = Number(row?.retry_after) || 0;
  if (retryAfter > 0) throw new PublicApiError("RATE_LIMITED", message, { status: 429, retryAfter });
}

export async function recordHit(keys) {
  const sql = getSql();
  for (const { key, max } of keys) {
    await sql`
      insert into admin_login_attempts as a (key_hash, failures, locked_until, updated_at)
      values (${key}, 1, null, now())
      on conflict (key_hash) do update set
        failures = case
          when a.updated_at < now() - make_interval(mins => ${WINDOW_MINUTES}) then 1
          else a.failures + 1
        end,
        locked_until = case
          when (case when a.updated_at < now() - make_interval(mins => ${WINDOW_MINUTES}) then 1 else a.failures + 1 end) >= ${max}
            then now() + make_interval(mins => ${LOCK_MINUTES})
          else a.locked_until
        end,
        updated_at = now()
    `;
  }
}

export async function clearHits(keys) {
  const sql = getSql();
  await sql`delete from admin_login_attempts where key_hash = any(${keys.map((item) => item.key)})`;
}

// Nombres usados por el login del admin.
export const assertLoginAllowed = (keys) => assertAllowed(keys);
export const recordLoginFailure = recordHit;
export const clearLoginFailures = clearHits;

function hashKey(value) {
  return crypto.createHmac("sha256", getAuthSecret()).update(`adapto:throttle:v1:${value}`).digest("hex");
}
