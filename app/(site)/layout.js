import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/components/shop/CartProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CartToast } from "@/components/shop/CartToast";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { getCatalog } from "@/lib/server/catalog";

export default async function SiteLayout({ children }) {
  const { isDemo } = await getCatalog();

  return (
    <CartProvider>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      {isDemo ? (
        <p className="bg-tinta px-4 py-1.5 text-center text-[12.5px] text-crema">
          Vista previa: los productos que ves son de ejemplo hasta conectar la base de datos.
        </p>
      ) : null}
      <Header />
      <main id="contenido">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
      <CartToast />
    </CartProvider>
  );
}
