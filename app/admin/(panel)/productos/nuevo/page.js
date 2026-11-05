import { getTaxonomy } from "@/lib/server/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { categories, subcategories } = await getTaxonomy();
  return <ProductForm categories={categories} subcategories={subcategories} />;
}
