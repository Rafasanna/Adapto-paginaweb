// Loader de next/image: las imágenes de Cloudinary se piden ya redimensionadas y en
// el mejor formato que soporte el navegador (AVIF/WebP), sin pasar por el
// optimizador de Vercel. El resto de URLs (archivos locales) se devuelve tal cual.
export default function imageLoader({ src, width, quality }) {
  const marker = "/image/upload/";
  if (src.includes("res.cloudinary.com") && src.includes(marker)) {
    const [base, rest] = src.split(marker);
    const transform = `f_auto,q_${quality || "auto"},c_limit,w_${width}`;
    return `${base}${marker}${transform}/${rest}`;
  }
  if (src.startsWith("/")) return src;
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}`;
}
