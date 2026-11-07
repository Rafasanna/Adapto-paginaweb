import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText, MessageCircle, Printer, ShoppingBag } from "lucide-react";
import { audiences } from "@/config/catalog";
import { site } from "@/config/site";
import { getCatalog, getProduct } from "@/lib/server/catalog";
import { pluralize } from "@/lib/format";
import { buildProductQuestion, whatsappUrl } from "@/lib/whatsapp";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AddToCart } from "@/components/shop/AddToCart";
import { Price } from "@/components/shop/Price";
import { ProductCard } from "@/components/shop/ProductCard";
import { TopicIcon } from "@/components/site/TopicIcon";

export const revalidate = 300;

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: "Producto no encontrado" };
  const { product } = data;
  return {
    title: product.name,
    description: product.shortDescription || site.description,
    openGraph: { title: product.name, description: product.shortDescription, images: product.previews[0]?.url ? [product.previews[0].url] : [] }
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  const { product, related, catalog } = data;
  const subcategory = catalog.subcategories.find((item) => item.slug === product.subcategory) || null;
  const category = catalog.categories.find((item) => item.slug === product.category) || null;
  const audienceNames = audiences.filter((item) => product.audiences.includes(item.slug)).map((item) => item.name);
  const subBySlug = new Map(catalog.subcategories.map((item) => [item.slug, item]));

  return (
    <div className="bg-white pb-24">
    <div className="container-site pt-5 lg:pt-8">
      <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1 text-[14px] text-gris">
        <Link href="/productos" className="hover:text-tinta hover:underline">
          Productos
        </Link>
        {category ? (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/productos?categoria=${category.slug}`} className="hover:text-tinta hover:underline">
              {category.name}
            </Link>
          </>
        ) : null}
        {subcategory ? (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/productos?tema=${subcategory.slug}`} className="hover:text-tinta hover:underline">
              {subcategory.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <ProductGallery previews={product.previews} name={product.name} color="bg-crema" />

        <div className="lg:sticky lg:top-24 lg:self-start">
          {subcategory ? (
            <Link
              href={`/productos?tema=${subcategory.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-linea bg-white py-0.5 pl-1 pr-3 text-[14px] font-semibold hover:border-teal"
            >
              <TopicIcon name={subcategory.icon} color={subcategory.color} className="h-7 w-7" />
              {subcategory.longName || subcategory.name}
            </Link>
          ) : null}

          <h1 className="title mt-4 text-[32px] sm:text-[40px]">{product.name}</h1>
          {product.shortDescription ? <p className="mt-3 text-[17px] leading-relaxed text-tinta/80">{product.shortDescription}</p> : null}

          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" className="mt-5" />

          <dl className="mt-4 flex flex-wrap gap-2 text-[14px]">
            <div className="flex items-center gap-1.5 rounded-full bg-crema px-3 py-1.5">
              <dt className="sr-only">Formato</dt>
              <FileText className="h-4 w-4 text-gris" />
              <dd>{product.format}</dd>
            </div>
            {product.pageCount ? (
              <div className="flex items-center gap-1.5 rounded-full bg-crema px-3 py-1.5">
                <dt className="sr-only">Páginas</dt>
                <dd>{pluralize(product.pageCount, "página", "páginas")}</dd>
              </div>
            ) : null}
            {audienceNames.length ? (
              <div className="flex items-center gap-1.5 rounded-full bg-crema px-3 py-1.5">
                <dt>Para</dt>
                <dd className="font-medium">{audienceNames.join(" · ")}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6">
            <AddToCart product={product} subcategoryName={subcategory?.name} />
          </div>

          {product.description ? (
            <section className="mt-8">
              <h2 className="title text-[20px]">Sobre este producto</h2>
              <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-tinta/85">
                {product.description.split(/\n{2,}/).map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : null}

          <ol className="mt-8 grid gap-3 rounded-[22px] bg-crema p-5 text-[15px]">
            <li className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-soft">
                <ShoppingBag className="h-4 w-4 text-teal-ink" />
              </span>
              <span>Sumás al carrito los productos que quieras, con la cantidad que necesites.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-soft">
                <MessageCircle className="h-4 w-4 text-teal-ink" />
              </span>
              <span>Nos enviás el pedido por WhatsApp y te pasamos los datos de pago.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-soft">
                <Printer className="h-4 w-4 text-teal-ink" />
              </span>
              <span>Te enviamos el PDF y lo imprimís las veces que quieras.</span>
            </li>
          </ol>

          <a
            href={whatsappUrl(buildProductQuestion(product))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-[15px] text-gris underline underline-offset-4 hover:text-tinta"
          >
            ¿Tenés dudas sobre este producto? Consultanos
          </a>
        </div>
      </div>

      {related.length ? (
        <section className="mt-20" aria-labelledby="relacionados">
          <div className="flex items-end justify-between gap-4">
            <h2 id="relacionados" className="title text-[28px]">
              También te puede servir
            </h2>
            <Link href="/productos" className="shrink-0 text-[15px] font-semibold underline underline-offset-4">
              Ver todos
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((item, index) => (
              <li key={item.id} className="flex">
                <ProductCard product={item} subcategory={subBySlug.get(item.subcategory)} index={index} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
    </div>
  );
}
