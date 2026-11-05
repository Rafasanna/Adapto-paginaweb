// Vista previa desde el PDF, 100% en el navegador (pdf.js).
// El PDF NUNCA se sube a ningún lado: se lee en la compu de quien carga el producto,
// se dibujan las páginas elegidas y solo esas imágenes (con marca de agua) van a Cloudinary.

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

// Página lista para subir: tamaño de vista previa + marca de agua opcional
export async function renderPreviewFile(doc, pageNumber, { watermark = true, name = "pagina" } = {}) {
  const canvas = await renderPage(doc, pageNumber, PREVIEW_WIDTH);
  if (watermark) drawWatermark(canvas);
  return canvasToWebpFile(canvas, `${name}-${pageNumber}`);
}

// "ADAPTO · vista previa" en diagonal, suave: se ve la hoja pero no sirve para imprimirla.
function drawWatermark(canvas) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const fontSize = Math.round(width * 0.045);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-Math.PI / 6);
  context.font = `600 ${fontSize}px "Outfit Variable", Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(46, 42, 39, 0.11)";
  const label = "ADAPTO · vista previa";
  const stepY = fontSize * 4.2;
  const stepX = context.measureText(label).width + fontSize * 2.5;
  const diagonal = Math.sqrt(width * width + height * height);
  for (let y = -diagonal / 2, row = 0; y <= diagonal / 2; y += stepY, row += 1) {
    const offset = row % 2 ? stepX / 2 : 0;
    for (let x = -diagonal / 2 - offset; x <= diagonal / 2; x += stepX) {
      context.fillText(label, x, y);
    }
  }
  context.restore();
}
