import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/server/auth";
import { errorResponse, json, PublicApiError, readJsonBody, validateMutationOrigin } from "@/lib/server/http";
import { createProduct } from "@/lib/server/products";

// POST /api/admin/products → crea un producto (solo con sesión de admin).
export async function POST(request) {
  try {
    validateMutationOrigin(request);
    if (!(await getAdminSession())) throw new PublicApiError("UNAUTHORIZED", "No autorizado.", { status: 401 });

    const body = await readJsonBody(request, { maxBytes: 64 * 1024 });
    const product = await createProduct(body);
    revalidatePath("/", "layout"); // la tienda muestra el producto nuevo sin esperar
    return json({ product }, { status: 201 });
  } catch (error) {
    return errorResponse(error, { scope: "admin-products-create", fallback: "No se pudo guardar el producto." });
  }
}
