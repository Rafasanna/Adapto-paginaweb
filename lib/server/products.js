import "server-only";
import { audiences } from "@/config/catalog";
import { getSql } from "./db";
import { PublicApiError } from "./http";
import { isOwnProductImage } from "./cloudinary";

// Lectura y escritura de productos para el admin.
// Toda la validación vive acá (en el servidor): el navegador nunca es fuente de verdad.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const AUDIENCE_SLUGS = new Set(audiences.map((item) => item.slug));
const MAX_PREVIEWS = 12;
const MAX_PRICE = 10_000_000;

export function assertUuid(id) {
  if (!UUID_RE.test(String(id || ""))) throw new PublicApiError("NOT_FOUND", "Producto no encontrado.", { status: 404 });
}

// "Trazos y grafismos: ¡del punto!" → "trazos-y-grafismos-del-punto"
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export async function getTaxonomy() {
  const sql = getSql();
  const [categories, subcategories] = await Promise.all([
    sql`select id, slug, name from categories order by sort_order asc, name asc`,
    sql`select id, category_id, slug, name, long_name, icon, color from subcategories order by sort_order asc, name asc`
  ]);
  return {
    categories: categories.map((row) => ({ id: row.id, slug: row.slug, name: row.name })),
    subcategories: subcategories.map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      slug: row.slug,
      name: row.name,
      longName: row.long_name,
      icon: row.icon,
      color: row.color
    }))
  };
}

export async function listAdminProducts() {
  const sql = getSql();
  const rows = await sql`
    select p.*, s.name as subcategory_name, c.name as category_name
    from products p
    join categories c on c.id = p.category_id
    left join subcategories s on s.id = p.subcategory_id
    order by p.sort_order asc, p.created_at desc
  `;
  return rows.map(mapRow);
}

export async function getAdminProduct(id) {
  assertUuid(id);
  const sql = getSql();
  const [row] = await sql`
    select p.*, s.name as subcategory_name, c.name as category_name
    from products p
    join categories c on c.id = p.category_id
    left join subcategories s on s.id = p.subcategory_id
    where p.id = ${id}
    limit 1
  `;
  return row ? mapRow(row) : null;
}

export async function createProduct(input) {
  const data = await validate(input, { partial: false });
  const sql = getSql();
  try {
    const [row] = await sql`
      insert into products (
        slug, name, short_description, description, price, compare_at_price,
        category_id, subcategory_id, previews, page_count, format, audiences, featured, visible
      ) values (
        ${data.slug}, ${data.name}, ${data.short_description}, ${data.description}, ${data.price}, ${data.compare_at_price},
        ${data.category_id}, ${data.subcategory_id}, ${JSON.stringify(data.previews)}::jsonb, ${data.page_count}, ${data.format},
        ${data.audiences}, ${data.featured}, ${data.visible}
      )
      returning id, slug
    `;
    return row;
  } catch (error) {
    throw translateDbError(error);
  }
}

// Edición completa (formulario) o parcial (ej. solo { visible } o { featured } desde el listado).
export async function updateProduct(id, input) {
  assertUuid(id);
  const current = await getAdminProduct(id);
  if (!current) throw new PublicApiError("NOT_FOUND", "Producto no encontrado.", { status: 404 });

  const data = await validate(input, {
    partial: true,
    current: { category_id: current.categoryId, subcategory_id: current.subcategoryId, price: current.price }
  });
  const entries = Object.entries(data);
  if (!entries.length) return { id, slug: current.slug };

  const sets = entries.map(([column], index) => (column === "previews" ? `${column} = $${index + 1}::jsonb` : `${column} = $${index + 1}`));
  const values = entries.map(([column, value]) => (column === "previews" ? JSON.stringify(value) : value));

  try {
    const sql = getSql();
    const rows = await sql.query(
      `update products set ${sets.join(", ")}, updated_at = now() where id = $${values.length + 1} returning id, slug`,
      [...values, id]
    );
    return { ...rows[0], previousSlug: current.slug };
  } catch (error) {
    throw translateDbError(error);
  }
}

export async function deleteProduct(id) {
  assertUuid(id);
  const sql = getSql();
  const [row] = await sql`delete from products where id = ${id} returning id, slug`;
  if (!row) throw new PublicApiError("NOT_FOUND", "Producto no encontrado.", { status: 404 });
  return row;
}

// ---------------------------------------------------------------------------

async function validate(input, { partial, current = {} }) {
  if (!input || typeof input !== "object") throw invalid("Datos inválidos.");
  const has = (key) => Object.prototype.hasOwnProperty.call(input, key);
  const out = {};

  if (!partial || has("name")) {
    out.name = text(input.name, { max: 140, label: "El nombre", required: true });
  }

  if (!partial || has("slug")) {
    const slug = slugify(input.slug || input.name);
    if (!slug || !SLUG_RE.test(slug)) throw invalid("La dirección del producto no es válida.");
    out.slug = slug;
  }

  if (!partial || has("shortDescription")) out.short_description = text(input.shortDescription, { max: 280, label: "La descripción corta" });
  if (!partial || has("description")) out.description = text(input.description, { max: 6000, label: "La descripción", multiline: true });

  if (!partial || has("price")) out.price = money(input.price, { label: "El precio", required: true });
  if (!partial || has("compareAtPrice")) out.compare_at_price = money(input.compareAtPrice, { label: "El precio anterior" }) || null;
  const price = out.price ?? current.price;
  if (out.compare_at_price != null && out.compare_at_price <= price) {
    throw invalid("El precio anterior tiene que ser mayor al precio actual (o dejalo vacío).");
  }

  if (!partial || has("categoryId") || has("subcategoryId")) {
    const categoryId = has("categoryId") ? input.categoryId : current.category_id;
    const subcategoryId = has("subcategoryId") ? input.subcategoryId || null : current.subcategory_id;
    if (!UUID_RE.test(String(categoryId || ""))) throw invalid("Elegí una categoría.");
    if (subcategoryId && !UUID_RE.test(String(subcategoryId))) throw invalid("El tema no es válido.");
    const sql = getSql();
    const [category] = await sql`select id from categories where id = ${categoryId}`;
    if (!category) throw invalid("La categoría no existe.");
    if (subcategoryId) {
      const [sub] = await sql`select id from subcategories where id = ${subcategoryId} and category_id = ${categoryId}`;
      if (!sub) throw invalid("El tema no corresponde a la categoría elegida.");
    }
    out.category_id = categoryId;
    out.subcategory_id = subcategoryId;
  }

  if (!partial || has("audiences")) {
    const list = Array.isArray(input.audiences) ? input.audiences : [];
    out.audiences = [...new Set(list.filter((item) => AUDIENCE_SLUGS.has(item)))];
  }

  if (!partial || has("previews")) {
    const list = Array.isArray(input.previews) ? input.previews : [];
    if (list.length > MAX_PREVIEWS) throw invalid(`Podés mostrar hasta ${MAX_PREVIEWS} páginas.`);
    out.previews = list.map((item, index) => {
      const url = String(item?.url || "");
      if (!isOwnProductImage(url)) throw invalid("Hay una imagen de vista previa que no es válida. Volvé a subirla.");
      return { url, alt: `Página ${index + 1}` };
    });
  }

  if (!partial || has("pageCount")) {
    const raw = input.pageCount;
    if (raw === "" || raw == null) out.page_count = null;
    else {
      const value = Number(raw);
      if (!Number.isInteger(value) || value < 1 || value > 2000) throw invalid("La cantidad de páginas no es válida.");
      out.page_count = value;
    }
  }

  if (!partial || has("format")) out.format = text(input.format, { max: 20, label: "El formato" }) || "PDF";
  if (!partial || has("featured")) out.featured = Boolean(input.featured);
  if (!partial || has("visible")) out.visible = input.visible === undefined ? true : Boolean(input.visible);

  return out;
}

function text(value, { max, label, required = false, multiline = false }) {
  let result = String(value ?? "")
    .replace(/\r\n/g, "\n")
    // sin caracteres de control (salvo saltos de línea en textos largos)
    .replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, "")
    .trim();
  if (multiline) result = result.replace(/\n{3,}/g, "\n\n");
  if (required && !result) throw invalid(`${label} es obligatorio.`);
  if (result.length > max) throw invalid(`${label} puede tener hasta ${max} caracteres.`);
  return result;
}

function money(value, { label, required = false }) {
  if (value === "" || value == null) {
    if (required) throw invalid(`${label} es obligatorio.`);
    return null;
  }
  const number = Number(String(value).replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(number) || number < 0 || number > MAX_PRICE) throw invalid(`${label} no es válido.`);
  return Math.round(number);
}

function invalid(message) {
  return new PublicApiError("INVALID_INPUT", message, { status: 400 });
}

function translateDbError(error) {
  if (error instanceof PublicApiError) return error;
  if (error?.code === "23505") {
    return new PublicApiError("SLUG_TAKEN", "Ya hay un producto con esa dirección. Cambiá el nombre o la dirección.", { status: 409 });
  }
  return error;
}

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description || "",
    description: row.description || "",
    price: Number(row.price) || 0,
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    categoryName: row.category_name,
    subcategoryName: row.subcategory_name || null,
    previews: Array.isArray(row.previews) ? row.previews : [],
    pageCount: row.page_count || null,
    format: row.format || "PDF",
    audiences: row.audiences || [],
    featured: Boolean(row.featured),
    visible: Boolean(row.visible),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
  };
}
