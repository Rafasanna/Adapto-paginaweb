import { Suspense } from "react";
import { Catalog } from "@/components/shop/Catalog";
import { getCatalog } from "@/lib/server/catalog";

export const revalidate = 300;

export const metadata = {
  title: "Recursos",
  description: "Actividades y guías terapéuticas listas para imprimir: escritura, motricidad fina, AVD, rutinas, emociones y más."
};

export default async function RecursosPage() {
  const { categories, subcategories, products } = await getCatalog();

  return (
    <div className="container-site pb-8 pt-8 lg:pt-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Tienda</p>
        <h1 className="title mt-2 text-[40px] sm:text-[52px]">Recursos para imprimir</h1>
        <p className="mt-3 text-[17px] text-gris">
          Elegí por tema o por edad, sumá al carrito las unidades que necesites y mandanos el pedido por WhatsApp.
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<div className="h-96" />}>
          <Catalog categories={categories} subcategories={subcategories} products={products} />
        </Suspense>
      </div>
    </div>
  );
}
