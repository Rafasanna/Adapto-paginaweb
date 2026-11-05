import { notFound } from "next/navigation";
import { getAdminProduct, getTaxonomy } from "@/lib/server/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  let product = null;
  try {
    product = await getAdminProduct(id);
  } catch {
    product = null; // id con formato inválido
  }
  if (!product) notFound();
  const { categories, subcategories } = await getTaxonomy();
  return <ProductForm product={product} categories={categories} subcategories={subcategories} />;
}
