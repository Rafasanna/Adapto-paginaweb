import { site } from "@/config/site";
import { getCatalog } from "@/lib/server/catalog";

export const revalidate = 3600;

export default async function sitemap() {
  const { products, isDemo } = await getCatalog();
  const pages = ["", "/productos", "/nosotras"].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly",
    priority: path ? 0.8 : 1
  }));
  if (isDemo) return pages;
  return [...pages, ...products.map((product) => ({ url: `${site.url}/productos/${product.slug}`, changeFrequency: "weekly", priority: 0.7 }))];
}
