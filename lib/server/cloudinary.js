import "server-only";
import crypto from "node:crypto";

// Carpetas permitidas en Cloudinary. El navegador pide un "scope" y el servidor firma
// solo para estas carpetas: nunca se acepta una carpeta arbitraria desde el navegador.
// El API secret no sale nunca del servidor.
export const UPLOAD_FOLDERS = {
  products: "adapto/productos",
  team: "adapto/equipo"
};

export function createUploadSignature(scope) {
  const folder = UPLOAD_FOLDERS[scope];
  if (!folder) {
    const error = new Error("Destino de subida no permitido.");
    error.status = 400;
    throw error;
  }

  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  // Solo imágenes: la firma incluye los formatos permitidos, así no se puede subir un PDF con ella.
  const params = { allowed_formats: "webp,jpg,png", folder, timestamp };
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    ...params,
    signature: crypto.createHash("sha1").update(`${payload}${config.apiSecret}`).digest("hex")
  };
}

// ¿La URL es una imagen de NUESTRA cuenta de Cloudinary, dentro de la carpeta indicada?
// La API rechaza cualquier otra URL.
export function isOwnProductImage(url) {
  return isOwnImage(url, "products");
}

export function isOwnImage(url, scope) {
  const folder = UPLOAD_FOLDERS[scope];
  if (!folder) return false;
  try {
    const { cloudName } = getCloudinaryConfig();
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") return false;
    const path = decodeURIComponent(parsed.pathname);
    return path.startsWith(`/${cloudName}/image/upload/`) && path.includes(`/${folder}/`);
  } catch {
    return false;
  }
}

export function getCloudinaryConfig() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || fromUrl.cloudName;
  const apiKey = process.env.CLOUDINARY_API_KEY || fromUrl.apiKey;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || fromUrl.apiSecret;

  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error("Cloudinary no está configurado en el servidor.");
    error.status = 503;
    throw error;
  }
  return { cloudName, apiKey, apiSecret };
}

function parseCloudinaryUrl(value) {
  const empty = { cloudName: "", apiKey: "", apiSecret: "" };
  if (!value) return empty;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "cloudinary:") return empty;
    return {
      cloudName: parsed.hostname,
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password)
    };
  } catch {
    return empty;
  }
}
