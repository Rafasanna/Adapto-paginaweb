/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

const nextConfig = {
  poweredByHeader: false,
  images: {
    // Cloudinary redimensiona y elige formato (ver lib/imageLoader.js).
    loader: "custom",
    loaderFile: "./lib/imageLoader.js"
  },
  async redirects() {
    return [
      // Antes la tienda vivía en /recursos: los links viejos siguen funcionando.
      { source: "/recursos", destination: "/productos", permanent: true },
      { source: "/recursos/:slug", destination: "/productos/:slug", permanent: true },
      { source: "/tienda", destination: "/productos", permanent: true }
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // El admin y su API nunca se indexan ni se guardan en caché compartida
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/api/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }
    ];
  }
};

export default nextConfig;
