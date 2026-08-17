"use client";

import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import { ImageUploadError, MAX_IMAGE_BYTES, uploadPropertyImage } from "@/lib/admin/property-images";
import { ImageOptimizeError, optimizeImageFile } from "@/lib/admin/image-optimize";
import { createClient } from "@/lib/supabase/client";
import { mapWithConcurrency } from "@/lib/admin/upload-queue";
import { cn } from "@/lib/utils";

// Hint for the OS file picker only — actual validation happens by trying to
// decode the file (see optimizeImageFile), which is what lets HEIC/HEIF
// through opportunistically on browsers that can open it.
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif";

// Cap on simultaneous browser→Supabase Storage uploads. Keeps a 10-15 photo
// batch from opening that many parallel connections at once while still
// uploading well ahead of one-at-a-time.
const UPLOAD_CONCURRENCY = 3;

type ImageItem = {
  key: string;
  url: string;
  alt: string;
  file?: File;
  previewUrl: string;
  status: "idle" | "uploading" | "error" | "done";
  error?: string;
};

export type PropertyImagesManagerHandle = {
  /**
   * Uploads every not-yet-uploaded file directly to Supabase Storage (max
   * `UPLOAD_CONCURRENCY` at a time) and resolves with the final ordered
   * `{ url, alt }` list once nothing is left pending or failed. If any
   * upload fails, the promise stays pending — the user resolves it by
   * clicking "Reintentar" (which re-runs this same step) or "Continuar sin
   * estas fotos" (which drops the failed items and resolves immediately)
   * inside this component.
   */
  commit(propertyId: string): Promise<{ url: string; alt: string }[]>;
};

export const PropertyImagesManager = forwardRef<
  PropertyImagesManagerHandle,
  { initialImages: { id: string; url: string; alt: string }[]; disabled?: boolean }
>(function PropertyImagesManager({ initialImages, disabled = false }, ref) {
  const [items, setItems] = useState<ImageItem[]>(
    initialImages.map((img) => ({
      key: img.id,
      url: img.url,
      alt: img.alt,
      previewUrl: img.url,
      status: "done",
    })),
  );
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState<{ done: number; total: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const pickerId = useId();

  const itemsRef = useRef(items);
  const commitRef = useRef<{ propertyId: string; resolve: (v: { url: string; alt: string }[]) => void } | null>(null);

  const isBusy = disabled || processing !== null || uploadProgress !== null;
  const hasFailedUploads = items.some((item) => item.status === "error");

  /** Every mutation goes through this so `itemsRef` is always in sync with
   * the latest state at the point control returns to `commit`/`runCommitStep` —
   * those run inside promise chains where a plain `useEffect` sync would lag
   * a tick behind. */
  const updateItems = useCallback((updater: (current: ImageItem[]) => ImageItem[]) => {
    setItems((current) => {
      const next = updater(current);
      itemsRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.file) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  async function handlePick(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const picked = Array.from(fileList);
    const errors: string[] = [];
    const next: ImageItem[] = [];

    setFileErrors([]);
    setProcessing({ done: 0, total: picked.length });

    for (let index = 0; index < picked.length; index++) {
      const file = picked[index];

      if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
        errors.push(`"${file.name}": no parece ser una imagen.`);
        setProcessing({ done: index + 1, total: picked.length });
        continue;
      }

      try {
        const optimized = await optimizeImageFile(file);
        if (optimized.size > MAX_IMAGE_BYTES) {
          errors.push(`"${file.name}": sigue pesando demasiado incluso optimizada (máx. 8MB).`);
        } else {
          next.push({
            key: `new-${Date.now()}-${index}`,
            url: "",
            alt: "",
            file: optimized,
            previewUrl: URL.createObjectURL(optimized),
            status: "idle",
          });
        }
      } catch (error) {
        errors.push(error instanceof ImageOptimizeError ? error.message : `"${file.name}": no se pudo procesar.`);
      }

      setProcessing({ done: index + 1, total: picked.length });
    }

    setFileErrors(errors);
    updateItems((current) => [...current, ...next]);
    setProcessing(null);
  }

  function removeItem(key: string) {
    updateItems((current) => {
      const target = current.find((item) => item.key === key);
      if (target?.file) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.key !== key);
    });
  }

  function move(key: string, direction: -1 | 1) {
    updateItems((current) => {
      const index = current.findIndex((item) => item.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function setAsCover(key: string) {
    updateItems((current) => {
      const index = current.findIndex((item) => item.key === key);
      if (index <= 0) return current;
      const next = [...current];
      const [target] = next.splice(index, 1);
      next.unshift(target);
      return next;
    });
  }

  function updateAlt(key: string, alt: string) {
    updateItems((current) => current.map((item) => (item.key === key ? { ...item, alt } : item)));
  }

  /** Uploads every item that still has a `file` and isn't already `done`,
   * with at most `UPLOAD_CONCURRENCY` in flight. A per-file failure marks
   * that item `error` and moves on — it never aborts the others. */
  const uploadPending = useCallback(async (propertyId: string) => {
    const pending = itemsRef.current.filter((item) => item.file && item.status !== "done");
    if (pending.length === 0) return;

    updateItems((current) =>
      current.map((item) => (item.file && item.status !== "done" ? { ...item, status: "uploading", error: undefined } : item)),
    );

    let doneCount = 0;
    setUploadProgress({ done: 0, total: pending.length });

    const supabase = createClient();

    await mapWithConcurrency(pending, UPLOAD_CONCURRENCY, async (item) => {
      try {
        const url = await uploadPropertyImage(supabase, propertyId, item.file!);
        updateItems((current) =>
          current.map((it) => (it.key === item.key ? { ...it, url, status: "done", error: undefined } : it)),
        );
      } catch (error) {
        const message =
          error instanceof ImageUploadError ? error.message : `"${item.file!.name}": no se pudo subir.`;
        updateItems((current) => current.map((it) => (it.key === item.key ? { ...it, status: "error", error: message } : it)));
      } finally {
        doneCount += 1;
        setUploadProgress({ done: doneCount, total: pending.length });
      }
    });

    setUploadProgress(null);
  }, [updateItems]);

  const runCommitStep = useCallback(async () => {
    const ctx = commitRef.current;
    if (!ctx) return;

    await uploadPending(ctx.propertyId);

    const settled = itemsRef.current;
    if (settled.some((item) => item.status === "error")) {
      // Leave the promise pending — the "Reintentar" / "Continuar sin estas
      // fotos" buttons below call back into this function to unblock it.
      return;
    }

    commitRef.current = null;
    ctx.resolve(settled.filter((item) => item.url).map((item) => ({ url: item.url, alt: item.alt })));
  }, [uploadPending]);

  function retryFailed() {
    void runCommitStep();
  }

  function discardFailed() {
    updateItems((current) => {
      for (const item of current) {
        if (item.status === "error" && item.file) URL.revokeObjectURL(item.previewUrl);
      }
      return current.filter((item) => item.status !== "error");
    });
    void runCommitStep();
  }

  useImperativeHandle(
    ref,
    () => ({
      commit(propertyId: string) {
        return new Promise<{ url: string; alt: string }[]>((resolve) => {
          commitRef.current = { propertyId, resolve };
          void runCommitStep();
        });
      },
    }),
    [runCommitStep],
  );

  return (
    <div>
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.key}
              className={cn(
                "overflow-hidden rounded-xl border bg-plata",
                item.status === "error" ? "border-terracota/50" : "border-grafito/10",
              )}
            >
              <div className="relative aspect-[4/3] bg-piedra">
                {item.previewUrl ? (
                  <Image
                    src={item.previewUrl}
                    alt=""
                    fill
                    unoptimized={Boolean(item.file)}
                    sizes="200px"
                    className="object-cover"
                  />
                ) : null}
                {index === 0 ? (
                  <span className="absolute left-2 top-2 rounded-md bg-grafito/85 px-2 py-0.5 font-utility text-[9px] font-medium uppercase tracking-[0.06em] text-blanco-roto">
                    Portada
                  </span>
                ) : null}
                {item.status === "uploading" ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-grafito/40">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blanco-roto/40 border-t-blanco-roto" />
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 p-2.5">
                {item.status === "error" ? (
                  <p className="text-[11px] leading-snug text-terracota">{item.error ?? "No se pudo subir."}</p>
                ) : null}
                <input
                  value={item.alt}
                  onChange={(event) => updateAlt(item.key, event.target.value)}
                  disabled={isBusy}
                  placeholder="Texto alternativo (SEO)"
                  className="w-full rounded-md border border-grafito/10 bg-blanco-roto px-2 py-1.5 text-xs text-grafito outline-none focus:border-petroleo disabled:opacity-60"
                />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(item.key, -1)}
                      disabled={isBusy || index === 0}
                      aria-label="Mover antes"
                      className="rounded-md px-1.5 py-1 text-xs text-grafito/50 transition-colors duration-150 ease-out hover:bg-piedra/50 disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(item.key, 1)}
                      disabled={isBusy || index === items.length - 1}
                      aria-label="Mover después"
                      className="rounded-md px-1.5 py-1 text-xs text-grafito/50 transition-colors duration-150 ease-out hover:bg-piedra/50 disabled:opacity-30"
                    >
                      →
                    </button>
                    {index !== 0 ? (
                      <button
                        type="button"
                        onClick={() => setAsCover(item.key)}
                        disabled={isBusy}
                        className="rounded-md px-1.5 py-1 font-utility text-[9px] uppercase tracking-[0.04em] text-petroleo transition-colors duration-150 ease-out hover:bg-piedra/50 disabled:opacity-30"
                      >
                        Hacer portada
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    disabled={isBusy}
                    aria-label="Quitar foto"
                    className="rounded-md px-1.5 py-1 text-xs text-terracota transition-colors duration-150 ease-out hover:bg-terracota/10 disabled:opacity-30"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-grafito/15 px-4 py-8 text-center text-sm text-grafito/50">
          Todavía no hay fotos cargadas.
        </p>
      )}

      {processing ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-grafito/55">
          <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-grafito/20 border-t-petroleo" />
          Optimizando fotos… ({processing.done} de {processing.total})
        </p>
      ) : null}

      {uploadProgress ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-grafito/55">
          <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-grafito/20 border-t-petroleo" />
          Subiendo fotos {uploadProgress.done} de {uploadProgress.total}…
        </p>
      ) : null}

      {hasFailedUploads && !uploadProgress ? (
        <div className="mt-3 rounded-lg border border-terracota/30 bg-terracota/5 p-3">
          <p className="text-xs text-terracota">
            Algunas fotos no se pudieron subir. Reintentá o continuá sin ellas para guardar el resto.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={retryFailed}
              className="rounded-md bg-terracota px-3 py-1.5 text-xs font-medium text-blanco-roto transition-colors duration-150 ease-out hover:bg-terracota/90"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={discardFailed}
              className="rounded-md border border-grafito/15 px-3 py-1.5 text-xs font-medium text-grafito transition-colors duration-150 ease-out hover:bg-piedra/40"
            >
              Continuar sin estas fotos
            </button>
          </div>
        </div>
      ) : null}

      {fileErrors.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {fileErrors.map((message) => (
            <li key={message} className="text-xs text-terracota">
              {message}
            </li>
          ))}
        </ul>
      ) : null}

      <label
        htmlFor={pickerId}
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-lg border border-grafito/10 px-4 py-2 text-sm font-medium text-grafito transition-colors duration-150 ease-out",
          isBusy ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-piedra/40",
        )}
      >
        + Agregar fotos
      </label>
      <input
        id={pickerId}
        type="file"
        multiple
        disabled={isBusy}
        accept={ACCEPT_ATTR}
        onChange={(event) => {
          handlePick(event.target.files);
          event.target.value = "";
        }}
        className="sr-only"
      />
      <p className="mt-2 font-body text-xs text-grafito/45">
        JPG, PNG, WEBP, AVIF o HEIC · se optimizan automáticamente a WebP (máx. 1920px de ancho) antes de
        subirse. La primera foto es la portada.
      </p>
    </div>
  );
});
