import { endAdminSession } from "@/lib/server/auth";
import { errorResponse, json, validateMutationOrigin } from "@/lib/server/http";

export async function POST(request) {
  try {
    validateMutationOrigin(request);
    await endAdminSession();
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error, { scope: "admin-logout" });
  }
}
