import "@fontsource-variable/outfit";
import "./globals.css";
import { site } from "@/config/site";

// Tipografía: Outfit, una geométrica de la misma familia visual que Codec Pro
// (la del "Recursos digitales" del logo), libre y con todos los pesos.

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    title: `${site.name} · ${site.descriptor}`,
    description: site.description,
    type: "website",
    locale: "es_AR",
    siteName: site.name
  }
};

export const viewport = {
  themeColor: "#F8F3EA"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
