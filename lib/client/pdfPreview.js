// Vista previa desde el PDF, 100% en el navegador (pdf.js).
// El PDF NUNCA se sube a ningún lado: se lee en la compu de quien carga el producto,
// se dibujan las páginas elegidas y solo esas imágenes van a Cloudinary.

import { canvasToWebpFile } from "./uploadImages";

const MAX_PDF_BYTES = 80 * 1024 * 1024;
const PREVIEW_WIDTH = 1000; // px: suficiente para ver la hoja, no para imprimirla bien
const THUMB_WIDTH = 150;

let pdfjsPromise = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // El worker se copia a /public al instalar (scripts/copy-pdf-worker.mjs)
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function openPdf(file) {
  if (!file) throw new Error("Elegí un archivo PDF.");
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
  if (!isPdf) throw new Error("El archivo tiene que ser un PDF.");
  if (file.size > MAX_PDF_BYTES) throw new Error("El PDF supera los 80 MB.");

  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  // isEvalSupported: false → pdf.js no ejecuta código generado a partir del PDF (más seguro)
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, enableXfa: false }).promise;
  return doc;
}

async function renderPage(doc, pageNumber, width) {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width / base.width });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // intent "print": dibuja como al imprimir y no depende de requestAnimationFrame,
  // así no se traba si la pestaña queda en segundo plano mientras procesa.
  await page.render({ canvasContext: context, viewport, intent: "print" }).promise;
  page.cleanup();
  return canvas;
}

// Miniatura chiquita para elegir qué páginas mostrar
export async function renderThumbnail(doc, pageNumber) {
  const canvas = await renderPage(doc, pageNumber, THUMB_WIDTH);
  return canvas.toDataURL("image/jpeg", 0.75);
}

// Página lista para subir, en tamaño de vista previa (1000 px de ancho)
export async function renderPreviewFile(doc, pageNumber, { name = "pagina" } = {}) {
  const canvas = await renderPage(doc, pageNumber, PREVIEW_WIDTH);
  return canvasToWebpFile(canvas, `${name}-${pageNumber}`);
}
