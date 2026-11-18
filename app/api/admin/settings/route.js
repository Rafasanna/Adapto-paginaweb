import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/server/auth";
import { errorResponse, json, PublicApiError, readJsonBody, validateMutationOrigin } from "@/lib/server/http";
import { updateAnnouncement, updateHero, updateHomeText, updateTeamPhoto } from "@/lib/server/settings";

// PATCH /api/admin/settings
//   { "home": { "welcome": "...", "who": "..." } }   → frase del banner de inicio
//   { "teamPhoto": { "member": "azu", "url": "..." } } → foto de Nosotras ("" = volver a la original)
//   { "announcement": { "enabled": true, "text": "...", "color": "#2E2A27" } } → barra de anuncio
//   { "hero": { "image": "https://res.cloudinary.com/...", "veil": "medio" } } → fondo del inicio ("" = sin foto)
export async function PATCH(request) {
  try {
    validateMutationOrigin(request);
    if (!(await getAdminSession())) throw new PublicApiError("UNAUTHORIZED", "No autorizado.", { status: 401 });

    const body = await readJsonBody(request, { maxBytes: 8 * 1024 });
    let result;
    if (body.home) result = { home: await updateHomeText(body.home) };
    else if (body.teamPhoto) result = { teamPhoto: await updateTeamPhoto(body.teamPhoto) };
    else if (body.announcement) result = { announcement: await updateAnnouncement(body.announcement) };
    else if (body.hero) result = { hero: await updateHero(body.hero) };
    else throw new PublicApiError("INVALID_INPUT", "No hay nada para guardar.");

    revalidatePath("/", "layout");
    return json(result);
  } catch (error) {
    return errorResponse(error, { scope: "admin-settings", fallback: "No se pudo guardar." });
  }
}
