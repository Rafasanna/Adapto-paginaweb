import "server-only";
import { cache } from "react";
import { getSql, isDatabaseConfigured } from "./db";
import { categories as baseCategories, subcategories as baseSubcategories } from "@/config/catalog";
import { demoProducts } from "@/data/demo-products";

// Lectura del catálogo.
// · Sin DATABASE_URL → categorías de config/catalog.js + productos de ejemplo (modo vista previa).
// · Con DATABASE_URL → todo sale de Neon. Si la base falla, el sitio sigue andando sin productos.

function mapCategory(row) {
  return { id: row.id, slug: row.slug, name: row.name, color: row.color, sortOrder: row.sort_order };
}

function mapSubcategory(row) {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category_slug,
    name: row.name,
    longName: row.long_name || null,
    detail: row.detail || null,
    color: row.color,
    icon: row.icon,
    sortOrder: row.sort_order
  };
}

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description || "",
    description: row.description || "",
    price: Number(row.price) || 0,
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    category: row.category_slug,
    subcategory: row.subcategory_slug || null,
    previews: Array.isArray(row.previews) ? row.previews.filter((item) => item?.url) : [],
    pageCount: row.page_count || null,
    format: row.format || "PDF",
    audiences: row.audiences || [],
    featured: Boolean(row.featured),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    sortOrder: row.sort_order
  };
}

async function readFromDatabase() {
  const sql = getSql();
  const [categoryRows, subcategoryRows, productRows] = await Promise.all([
    sql`select * from categories where visible = true order by sort_order asc, name asc`,
    sql`
      select s.*, c.slug as category_slug
      from subcategories s join categories c on c.id = s.category_id
      where s.visible = true and c.visible = true
      order by s.sort_order asc, s.name asc
    `,
    sql`
      select p.*, c.slug as category_slug, s.slug as subcategory_slug
      from products p
      join categories c on c.id = p.category_id
      left join subcategories s on s.id = p.subcategory_id
      where p.visible = true and c.visible = true
      order by p.sort_order asc, p.created_at desc
    `
  ]);
  return {
    categories: categoryRows.map(mapCategory),
    subcategories: subcategoryRows.map(mapSubcategory),
    products: productRows.map(mapProduct),
    isDemo: false
  };
}

export const getCatalog = cache(async () => {
  if (!isDatabaseConfigured()) {
    return { categories: baseCategories, subcategories: baseSubcategories, products: demoProducts, isDemo: true };
  }
  try {
    return await readFromDatabase();
  } catch (error) {
    console.error("[catalog] No se pudo leer la base:", error?.message);
    return { categories: baseCategories, subcategories: baseSubcategories, products: [], isDemo: false };
  }
});

export async function getProduct(slug) {
  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) return null;
  const related = catalog.products
    .filter((item) => item.slug !== slug)
    .sort((a, b) => score(b, product) - score(a, product))
    .slice(0, 4);
  return { product, related, catalog };
}

function score(candidate, product) {
  let points = 0;
  if (candidate.subcategory && candidate.subcategory === product.subcategory) points += 3;
  if (candidate.category === product.category) points += 1;
  if (candidate.featured) points += 0.5;
  return points;
}
