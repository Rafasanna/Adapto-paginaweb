import { getAdminSession } from "@/lib/server/auth";
import { errorResponse, json } from "@/lib/server/http";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return json({ session: null }, { status: 401 });
    return json({ session: session.user });
  } catch (error) {
    return errorResponse(error, { scope: "admin-session" });
  }
}
