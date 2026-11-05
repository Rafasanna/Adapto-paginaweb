// Copia el "worker" de pdf.js a /public para que el admin pueda leer PDFs en el navegador.
// Corre solo antes de `npm run dev` y `npm run build` (también en Vercel).
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const source = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
const target = path.join(process.cwd(), "public", "pdf.worker.min.mjs");

await mkdir(path.dirname(target), { recursive: true });
await copyFile(source, target);
console.log("pdf.js worker listo en /public/pdf.worker.min.mjs");
