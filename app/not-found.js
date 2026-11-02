import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/components/shop/CartProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";

export default function NotFound() {
  return (
    <CartProvider>
      <Header />
      <main className="bg-grid relative overflow-hidden">
        <div className="container-site relative flex min-h-[60vh] flex-col items-start justify-center py-24">
          <p className="eyebrow">Error 404</p>
          <h1 className="title mt-3 text-[44px] sm:text-[64px]">Esta página no existe</h1>
          <p className="mt-3 text-[17px] text-gris">Puede que el producto ya no esté disponible o que el link haya cambiado.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/productos" className="btn-primary">Ver productos</Link>
            <Link href="/" className="btn-outline">Ir al inicio</Link>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
