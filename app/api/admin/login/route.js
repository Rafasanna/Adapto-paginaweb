import { startAdminSession, verifyAdminCredentials } from "@/lib/server/auth";
import { errorResponse, getClientIp, json, PublicApiError, readJsonBody, validateMutationOrigin } from "@/lib/server/http";
import { assertLoginAllowed, buildLoginKeys, clearLoginFailures, recordLoginFailure } from "@/lib/server/loginThrottle";

export async function POST(request) {
  try {
    validateMutationOrigin(request);
    const body = await readJsonBody(request, { maxBytes: 4 * 1024 });
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      throw new PublicApiError("INVALID_INPUT", "Email y contraseña son obligatorios.");
    }

    const ip = getClientIp(request);
    const keys = buildLoginKeys({ ip, email });
    await assertLoginAllowed(keys);

    const user = await verifyAdminCredentials({ email, password });
    if (!user) {
      await recordLoginFailure(keys);
      throw new PublicApiError("INVALID_CREDENTIALS", "Email o contraseña incorrectos.", { status: 401 });
    }

    await clearLoginFailures(keys);
    const session = await startAdminSession(user, { ipAddress: ip, userAgent: request.headers.get("user-agent") });
    return json({ session });
  } catch (error) {
    return errorResponse(error, { scope: "admin-login" });
  }
}
