import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getSql, isDatabaseConfigured } from "./db";

// Usuarias en admin_users (contraseña con bcrypt), sesiones en admin_sessions
// (se guarda solo el hash del token) y cookie httpOnly firmada con HMAC(AUTH_SECRET).
// Duración de la sesión: 8 horas.

export const ADMIN_COOKIE = "adapto_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;
// Hash bcrypt fijo de una contraseña aleatoria que nunca se acepta: mantiene el mismo
// costo de tiempo cuando el email no existe o la cuenta está inactiva.
const DUMMY_PASSWORD_HASH = "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";

export async function verifyAdminCredentials({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const candidate = typeof password === "string" ? password : "";
  if (!normalizedEmail || !candidate) return null;

  const sql = getSql();
  const [user] = await sql`
    select id, email, name, password_hash, role, active
    from admin_users
    where lower(email) = ${normalizedEmail}
    limit 1
  `;
  const eligible = Boolean(user && user.active !== false && user.password_hash);
  const matches = await bcrypt.compare(candidate, eligible ? user.password_hash : DUMMY_PASSWORD_HASH);
  return eligible && matches ? user : null;
}

export async function startAdminSession(user, { ipAddress = null, userAgent = null } = {}) {
  const sql = getSql();
  const sessionId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await sql`
    insert into admin_sessions (id, admin_user_id, session_token_hash, expires_at, ip_address, user_agent)
    values (${sessionId}, ${user.id}, ${hashToken(token)}, ${expiresAt.toISOString()}, ${ipAddress}, ${String(userAgent || "").slice(0, 300)})
  `;
  await sql`update admin_users set last_login_at = now() where id = ${user.id}`;

  const unsigned = `${sessionId}.${token}`;
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, `${unsigned}.${sign(unsigned)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });

  return mapAdminUser(user);
}

// Se usa en layouts/páginas del admin y en route handlers. cache() evita
// consultar la base más de una vez por request.
export const getAdminSession = cache(async () => {
  if (!isDatabaseConfigured() || !process.env.AUTH_SECRET) return null;

  const cookieStore = await cookies();
  const parsed = parseSessionCookie(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!parsed) return null;

  const sql = getSql();
  const [session] = await sql`
    select
      admin_sessions.id,
      admin_sessions.admin_user_id,
      admin_sessions.session_token_hash,
      admin_sessions.expires_at,
      admin_sessions.revoked_at,
      admin_users.email,
      admin_users.name,
      admin_users.role,
      admin_users.active
    from admin_sessions
    join admin_users on admin_users.id = admin_sessions.admin_user_id
    where admin_sessions.id = ${parsed.sessionId}
    limit 1
  `;
  if (!session || session.revoked_at || session.active === false) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) return null;
  if (!safeEqual(hashToken(parsed.token), session.session_token_hash)) return null;

  return {
    sessionId: session.id,
    user: mapAdminUser({
      id: session.admin_user_id,
      email: session.email,
      name: session.name,
      role: session.role
    })
  };
});

export async function endAdminSession() {
  const cookieStore = await cookies();
  const parsed = parseSessionCookie(cookieStore.get(ADMIN_COOKIE)?.value);
  if (parsed && isDatabaseConfigured()) {
    const sql = getSql();
    await sql`
      update admin_sessions
      set revoked_at = now()
      where id = ${parsed.sessionId} and revoked_at is null
    `;
  }
  cookieStore.delete(ADMIN_COOKIE);
}

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || "";
  if (secret.length < 32) {
    throw new Error("AUTH_SECRET debe estar configurado y tener al menos 32 caracteres.");
  }
  return secret;
}

function parseSessionCookie(value) {
  if (!value) return null;
  const [sessionId, token, signature] = String(value).split(".");
  if (!sessionId || !token || !signature) return null;
  if (!safeEqual(sign(`${sessionId}.${token}`), signature)) return null;
  return { sessionId, token };
}

function sign(value) {
  return crypto.createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function mapAdminUser(user) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name || user.email || "Administrador",
    role: user.role || "admin"
  };
}
