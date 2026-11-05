import { getAdminSession } from "@/lib/server/auth";
import { createUploadSignature } from "@/lib/server/cloudinary";
import { errorResponse, json, PublicApiError, readJsonBody, validateMutationOrigin } from "@/lib/server/http";

// Devuelve una firma de Cloudinary para que el admin suba imágenes (páginas de vista previa o fotos de Nosotras)
// directo desde el navegador, sin exponer el API secret. Body: { "scope": "products" }
export async function POST(request) {
  try {
    validateMutationOrigin(request);
    const session = await getAdminSession();
    if (!session) throw new PublicApiError("UNAUTHORIZED", "No autorizado.", { status: 401 });

    const { scope } = await readJsonBody(request, { maxBytes: 1024 });
    try {
      return json({ upload: createUploadSignature(scope) });
    } catch (error) {
      throw new PublicApiError("UPLOAD_NOT_AVAILABLE", error.message, { status: error.status || 500 });
    }
  } catch (error) {
    return errorResponse(error, { scope: "cloudinary-signature" });
  }
}
