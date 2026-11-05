import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/server/auth";
import { errorResponse, json, PublicApiError, readJsonBody, validateMutationOrigin } from "@/lib/server/http";
import { deleteProduct, updateProduct } from "@/lib/server/products";

async function requireAdmin(request) {
  validateMutationOrigin(request);
  if (!(await getAdminSession())) throw new PublicApiError("UNAUTHORIZED", "No autorizado.", { status: 401 });
}

// PATCH /api/admin/products/:id → edita (todo el formulario o solo algunos campos)
export async function PATCH(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await readJsonBody(request, { maxBytes: 64 * 1024 });
    const product = await updateProduct(id, body);
    revalidatePath("/", "layout");
    return json({ product });
  } catch (error) {
    return errorResponse(error, { scope: "admin-products-update", fallback: "No se pudo guardar el producto." });
  }
}

// DELETE /api/admin/products/:id → borra el producto
export async function DELETE(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const product = await deleteProduct(id);
    revalidatePath("/", "layout");
    return json({ product });
  } catch (error) {
    return errorResponse(error, { scope: "admin-products-delete", fallback: "No se pudo borrar el producto." });
  }
}
