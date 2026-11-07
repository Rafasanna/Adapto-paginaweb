"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FileText, ImagePlus, Loader2, ShieldCheck, X } from "lucide-react";
import { uploadImages } from "@/lib/client/uploadImages";
import { cn } from "@/lib/utils";

const MAX_PREVIEWS = 12;
const MAX_THUMBS = 40;
const DEFAULT_SELECTED = 3;

// Editor de las páginas que se muestran en el carrusel del producto.
// Camino principal: elegir el PDF → marcar páginas → se dibujan en el navegador con
// marca de agua y se suben SOLO esas imágenes. El PDF no sale de la compu.
export function PreviewsEditor({ previews, onChange, onPdfInfo, disabled }) {
  const [pdf, setPdf] = useState(null); // { doc, name, numPages }
  const [thumbs, setThumbs] = useState([]); // [{ page, url }]
  const [selected, setSelected] = useState([]);
  const [watermark, setWatermark] = useState(true);
  const [status, setStatus] = useState(null); // { type: "working" | "error", text }
  const pdfInput = useRef(null);
  const imageInput = useRef(null);
  const run = useRef(0); // cambia al cancelar: corta la generación de miniaturas en curso
  const working = status?.type === "working";

  // Libera la memoria del PDF al cerrar el selector o salir de la pantalla
  useEffect(() => () => pdf?.doc?.destroy?.(), [pdf]);

  async function choosePdf(file) {
    if (!file) return;
    const runId = ++run.current;
    setStatus({ type: "working", text: "Leyendo el PDF…" });
    setThumbs([]);
    try {
      const { openPdf, renderThumbnail } = await import("@/lib/client/pdfPreview");
      const doc = await openPdf(file);
      if (runId !== run.current) return doc.destroy();
      const name = file.name.replace(/\.pdf$/i, "");
      setPdf({ doc, name, numPages: doc.numPages });
      onPdfInfo?.({ numPages: doc.numPages, name });
      const total = Math.min(doc.numPages, MAX_THUMBS);
      setSelected(Array.from({ length: Math.min(DEFAULT_SELECTED, total) }, (_, index) => index + 1));
      const list = [];
      for (let page = 1; page <= total; page += 1) {
        if (runId !== run.current) return;
        setStatus({ type: "working", text: `Preparando páginas… ${page} de ${total}` });
        list.push({ page, url: await renderThumbnail(doc, page) });
        setThumbs([...list]);
      }
      setStatus(null);
    } catch (error) {
      if (runId !== run.current) return;
      setPdf(null);
      setStatus({ type: "error", text: error?.message?.includes("password") ? "El PDF tiene contraseña: no se puede leer." : error.message || "No se pudo leer el PDF." });
    }
  }

  function togglePage(page) {
    setSelected((current) => {
      if (current.includes(page)) return current.filter((item) => item !== page);
      if (current.length >= MAX_PREVIEWS) return current;
      return [...current, page].sort((a, b) => a - b);
    });
  }

  async function uploadSelected() {
    if (!pdf || !selected.length) return;
    try {
      const { renderPreviewFile } = await import("@/lib/client/pdfPreview");
      const files = [];
      for (const [index, page] of selected.entries()) {
        setStatus({ type: "working", text: `Generando página ${index + 1} de ${selected.length}…` });
        files.push(await renderPreviewFile(pdf.doc, page, { watermark, name: slugish(pdf.name) }));
      }
      const uploaded = await uploadImages(files, {
        optimize: false,
        onProgress: (done, total) => setStatus({ type: "working", text: `Subiendo ${done} de ${total}…` })
      });
      onChange(uploaded.map((item, index) => ({ url: item.url, alt: `Página ${index + 1}` })));
      closePdf();
      setStatus(null);
    } catch (error) {
      setStatus({ type: "error", text: error.message || "No se pudieron subir las páginas." });
    }
  }

  async function uploadLooseImages(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const room = MAX_PREVIEWS - previews.length;
    if (room <= 0) return setStatus({ type: "error", text: `Ya hay ${MAX_PREVIEWS} páginas, que es el máximo.` });
    try {
      const uploaded = await uploadImages(files.slice(0, room), {
        onProgress: (done, total) => setStatus({ type: "working", text: `Subiendo ${done} de ${total}…` })
      });
      onChange([...previews, ...uploaded.map((item) => ({ url: item.url }))]);
      setStatus(null);
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    }
  }

  function closePdf() {
    run.current += 1;
    setPdf(null); // el efecto de arriba libera la memoria del PDF
    setThumbs([]);
    setSelected([]);
    if (pdfInput.current) pdfInput.current.value = "";
  }

  function move(index, delta) {
    const next = [...previews];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  }

  return (
    <div>
      {/* Páginas actuales */}
      {previews.length ? (
        <ol className="flex gap-3 overflow-x-auto pb-2">
          {previews.map((item, index) => (
            <li key={item.url} className="w-[108px] shrink-0">
              <div className="paper relative aspect-[210/297] bg-crema">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={`Página ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-teal-dark px-2 py-0.5 text-[11px] font-semibold text-tinta">Portada</span>
                ) : null}
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || disabled}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-crema disabled:opacity-30"
                  aria-label={`Mover la página ${index + 1} antes`}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(previews.filter((_, position) => position !== index))}
                  disabled={disabled}
                  className="grid h-8 w-8 place-items-center rounded-full text-pink-ink hover:bg-pink-soft"
                  aria-label={`Quitar la página ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === previews.length - 1 || disabled}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-crema disabled:opacity-30"
                  aria-label={`Mover la página ${index + 1} después`}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-2xl bg-crema px-4 py-3 text-[14px] text-gris">Todavía no hay páginas. La primera que subas va a ser la portada.</p>
      )}

      {/* Acciones */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => pdfInput.current?.click()} disabled={working || disabled} className="btn-primary min-h-[44px] text-[15px]">
          <FileText className="h-4 w-4" />
          {previews.length ? "Reemplazar desde el PDF" : "Elegir PDF"}
        </button>
        <button type="button" onClick={() => imageInput.current?.click()} disabled={working || disabled} className="btn-outline min-h-[44px] text-[15px]">
          <ImagePlus className="h-4 w-4" />
          Subir imágenes
        </button>
        <input ref={pdfInput} type="file" accept="application/pdf,.pdf" className="sr-only" tabIndex={-1} onChange={(event) => choosePdf(event.target.files?.[0])} />
        <input
          ref={imageInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            uploadLooseImages(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <p className="mt-2.5 flex items-start gap-2 text-[13px] leading-snug text-gris">
        <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-teal-ink" />
        El PDF no se sube a internet: se lee en esta compu y solo se suben las páginas que elijas, como imágenes.
      </p>

      {status ? (
        <p
          role={status.type === "error" ? "alert" : "status"}
          className={cn(
            "mt-3 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[14px]",
            status.type === "error" ? "bg-pink-soft text-pink-ink" : "bg-teal-soft text-teal-ink"
          )}
        >
          {status.type === "working" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {status.text}
        </p>
      ) : null}

      {/* Selector de páginas del PDF */}
      {pdf ? (
        <div className="mt-4 rounded-2xl border-2 border-teal bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{pdf.name}.pdf</p>
              <p className="text-[14px] text-gris">
                {pdf.numPages} páginas · marcá las que se van a ver en la tienda ({selected.length}/{MAX_PREVIEWS})
                {pdf.numPages > MAX_THUMBS ? ` · se muestran las primeras ${MAX_THUMBS}` : ""}
              </p>
            </div>
            <button type="button" onClick={closePdf} className="grid h-9 w-9 place-items-center rounded-full hover:bg-crema" aria-label="Cancelar">
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-6">
            {thumbs.map((thumb) => {
              const order = selected.indexOf(thumb.page);
              const active = order !== -1;
              return (
                <li key={thumb.page}>
                  <button
                    type="button"
                    onClick={() => togglePage(thumb.page)}
                    aria-pressed={active}
                    className={cn("relative block w-full overflow-hidden rounded-lg border-2 bg-white transition-colors", active ? "border-teal-deep" : "border-linea opacity-70 hover:opacity-100")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb.url} alt={`Página ${thumb.page}`} className="block w-full" />
                    <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-1.5 text-[11px] font-semibold">p. {thumb.page}</span>
                    {active ? (
                      <span className="absolute right-1 top-1 grid h-6 min-w-6 place-items-center rounded-full bg-teal-dark px-1 text-[11px] font-bold text-tinta">
                        {order === 0 ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : order + 1}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <label className="mt-4 flex items-start gap-2.5 text-[14px]">
            <input type="checkbox" checked={watermark} onChange={(event) => setWatermark(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2F7A66]" />
            <span>
              <strong className="font-semibold">Marca de agua “ADAPTO · vista previa”</strong>
              <span className="block text-gris">Recomendado: se ve la hoja, pero no sirve para imprimirla.</span>
            </span>
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={uploadSelected} disabled={!selected.length || working} className="btn-primary min-h-[44px] text-[15px]">
              {working ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Usar {selected.length === 1 ? "esta página" : `estas ${selected.length} páginas`}
            </button>
            <span className="text-[13px] text-gris">La primera marcada es la portada.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function slugish(text) {
  return String(text || "pagina")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "pagina";
}
