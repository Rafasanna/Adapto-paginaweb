// Subida de imágenes desde el admin a Cloudinary con una firma que da el servidor.
// Las imágenes se redimensionan y convierten a WebP en el navegador antes de subir.

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 1200 * 1024;
const MAX_DIMENSION = 1400;
const QUALITIES = [0.84, 0.76, 0.68];

// files: File[] (ya en WebP o imágenes comunes).
// scope: "products" (páginas de vista previa) | "team" (fotos de Nosotras)
// square: recorta al centro en cuadrado (fotos de perfil). onProgress(done, total) opcional.
export async function uploadImages(files, { scope = "products", optimize = true, square = false, onProgress } = {}) {
  const list = Array.from(files ?? []);
  list.forEach(validateImageFile);
  const authorization = await requestSignature(scope);
  const results = [];
  for (const [index, file] of list.entries()) {
    const ready = optimize ? await optimizeImage(file, { square }) : file;
    results.push(await uploadToCloudinary(ready, authorization));
    onProgress?.(index + 1, list.length);
  }
  return results;
}

export function validateImageFile(file) {
  if (!file || !ALLOWED_TYPES.has(String(file.type).toLowerCase())) {
    throw new Error("Formato no permitido. Usá JPG, PNG o WebP.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("La imagen supera los 15 MB.");
  }
}

async function requestSignature(scope) {
  const response = await fetch("/api/admin/cloudinary-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.upload) {
    throw new Error(payload.message || "No se pudo autorizar la subida de imágenes.");
  }
  return payload.upload;
}

async function uploadToCloudinary(file, upload) {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", upload.apiKey);
  form.append("timestamp", String(upload.timestamp));
  form.append("signature", upload.signature);
  form.append("folder", upload.folder);
  form.append("allowed_formats", upload.allowed_formats);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(upload.cloudName)}/image/upload`, {
    method: "POST",
    body: form
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Error al subir la imagen.");
  }
  return { url: data.secure_url, width: data.width, height: data.height };
}

async function optimizeImage(file, { square = false } = {}) {
  const bitmap = await createImageBitmap(file);
  try {
    // Recorte: cuadrado centrado (fotos de perfil) o la imagen completa
    const side = Math.min(bitmap.width, bitmap.height);
    const source = square
      ? { x: (bitmap.width - side) / 2, y: (bitmap.height - side) / 2, w: side, h: side }
      : { x: 0, y: 0, w: bitmap.width, h: bitmap.height };
    const max = square ? 900 : MAX_DIMENSION;
    const scale = Math.min(1, max / Math.max(source.w, source.h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(source.w * scale);
    canvas.height = Math.round(source.h * scale);
    const context = canvas.getContext("2d");
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, source.x, source.y, source.w, source.h, 0, 0, canvas.width, canvas.height);
    return await canvasToWebpFile(canvas, file.name);
  } finally {
    bitmap.close();
  }
}

export async function canvasToWebpFile(canvas, name = "pagina") {
  let blob = null;
  for (const quality of QUALITIES) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.size <= MAX_OUTPUT_BYTES) break;
  }
  if (!blob) throw new Error("No se pudo preparar la imagen.");
  // Safari viejo no exporta WebP: en ese caso queda en PNG/JPG, que también se acepta.
  const type = blob.type || "image/png";
  const extension = type === "image/webp" ? "webp" : type === "image/jpeg" ? "jpg" : "png";
  const baseName = String(name).replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "pagina";
  return new File([blob], `${baseName}.${extension}`, { type });
}
