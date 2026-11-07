import { Suspense } from "react";
import { Catalog } from "@/components/shop/Catalog";
import { getCatalog } from "@/lib/server/catalog";

export const revalidate = 300;

export const metadata = {
  title: "Productos",
  description: "Actividades y guías terapéuticas listas para imprimir: escritura, motricidad fina, AVD, rutinas, emociones y más."
};

export default async function ProductosPage() {
  const { categories, subcategories, products } = await getCatalog();

  return (
    <div className="bg-white pb-24">
      <header className="bg-white relative overflow-hidden border-b-2 border-linea">
        <div className="container-site relative py-7 sm:py-10 lg:py-14">
          <p className="eyebrow">Tienda</p>
          <div className="max-w-2xl">
            <h1 className="title mt-2 text-[34px] sm:text-[52px]">Productos para imprimir</h1>
            <p className="mt-2 text-[16px] text-gris sm:mt-3 sm:text-[17px]">
              Elegí por tema o por edad, sumá al carrito las unidades que necesites y mandanos el pedido por WhatsApp.
            </p>
          </div>
        </div>
      </header>

      <div className="container-site mt-6">
        <Suspense fallback={<div className="h-96" />}>
          <Catalog categories={categories} subcategories={subcategories} products={products} />
        </Suspense>
      </div>
    </div>
  );
}
