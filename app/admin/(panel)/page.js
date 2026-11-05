import { listAdminProducts } from "@/lib/server/products";
import { ProductList } from "@/components/admin/ProductList";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();
  return <ProductList products={products} />;
}
