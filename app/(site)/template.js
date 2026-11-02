// Se vuelve a montar en cada navegación: da una transición suave entre páginas.
export default function SiteTemplate({ children }) {
  return <div className="page-enter">{children}</div>;
}
