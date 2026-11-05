import "server-only";

export class PublicApiError extends Error {
  constructor(code, message, { status = 400, retryAfter = null } = {}) {
    super(message);
    this.name = "PublicApiError";
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function json(payload, init = {}, { sensitive = true } = {}) {
  const headers = new Headers(init.headers);
  if (sensitive) headers.set("Cache-Control", "private, no-store");
  return Response.json(payload, { ...init, headers });
}

export function errorResponse(error, { scope = "api", fallback = "No pudimos procesar la solicitud." } = {}) {
  const controlled = error instanceof PublicApiError;
  const status = controlled ? error.status : 500;
  if (!controlled) console.error(`[${scope}]`, sanitize(error?.message));
  const headers = {};
  if (controlled && error.retryAfter) headers["Retry-After"] = String(error.retryAfter);
  return json(
    { error: controlled ? error.code : "INTERNAL_ERROR", message: controlled ? error.message : fallback },
    { status, headers }
  );
}

export async function readJsonBody(request, { maxBytes = 64 * 1024 } = {}) {
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    throw new PublicApiError("BODY_TOO_LARGE", "El cuerpo de la solicitud es demasiado grande.", { status: 413 });
  }
  let value;
  try {
    value = JSON.parse(text || "{}");
  } catch {
    throw new PublicApiError("INVALID_JSON", "El cuerpo JSON no es válido.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PublicApiError("INVALID_JSON", "El cuerpo JSON debe ser un objeto.");
  }
  return value;
}

// Bloquea POST/PUT/PATCH/DELETE que vengan de otro dominio (CSRF).
export function validateMutationOrigin(request) {
  const method = String(request.method || "GET").toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return;

  const runtime = String(process.env.VERCEL_ENV || "").toLowerCase();
  const productionLike = runtime === "production" || runtime === "preview";
  const originHeader = request.headers.get("origin");

  if (!originHeader) {
    if (!productionLike) return;
    throw new PublicApiError("ORIGIN_REQUIRED", "Origen de solicitud no permitido.", { status: 403 });
  }

  let origin;
  try {
    origin = new URL(originHeader).origin;
  } catch {
    throw new PublicApiError("ORIGIN_NOT_ALLOWED", "Origen de solicitud no permitido.", { status: 403 });
  }

  const allowed = new Set([new URL(request.url).origin]);
  for (const value of [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ]) {
    if (!value) continue;
    try {
      allowed.add(new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin);
    } catch {}
  }

  if (!productionLike && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin)) return;
  if (!allowed.has(origin)) {
    throw new PublicApiError("ORIGIN_NOT_ALLOWED", "Origen de solicitud no permitido.", { status: 403 });
  }
}

export function getClientIp(request) {
  // Solo confiamos en headers de proxy cuando corre en Vercel.
  if (process.env.VERCEL !== "1") return "local";
  const raw = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "";
  return raw.split(",")[0].trim().slice(0, 64) || "unknown";
}

function sanitize(value) {
  return String(value || "Error sin mensaje")
    .replace(/\b(?:postgres(?:ql)?):\/\/\S+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/(password|cookie|authorization|auth_secret)\s*[:=]\s*\S+/gi, "$1=[REDACTED]")
    .slice(0, 400);
}
