// Todo /admin queda fuera de buscadores.
export const metadata = {
  title: { absolute: "Admin · ADAPTO" },
  robots: { index: false, follow: false }
};

export default function AdminRootLayout({ children }) {
  return <div className="min-h-screen bg-crema">{children}</div>;
}
