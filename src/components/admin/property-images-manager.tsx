"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { MAX_IMAGE_BYTES } from "@/lib/admin/property-images";
import { ImageOptimizeError, optimizeImageFile } from "@/lib/admin/image-optimize";
import { cn } from "@/lib/utils";

// Hint for the OS file picker only — actual validation happens by trying to
// decode the file (see optimizeImageFile), which is what lets HEIC/HEIF
// through opportunistically on browsers that can open it.
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif";

type ImageItem = {
  key: string;
  url: string;
  alt: string;
  file?: File;
  previewUrl: string;
};

export function PropertyImagesManager({
  initialImages,
  disabled = false,
}: {
  initialImages: { id: string; url: string; alt: string }[];
  disabled?: boolean;
}) {
  const [items, setItems] = useState<ImageItem[]>(
    initialImages.map((img) => ({ key: img.id, url: img.url, alt: img.alt, previewUrl: img.url })),
  );
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerId = useId();
  const isBusy = disabled || processing !== null;

  // Keep the hidden multi-file input's FileList in sync with `items` so the
  // native form submission carries exactly the staged new files, in order.
  useEffect(() => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    for (const item of items) {
      if (item.file) dt.items.add(item.file);
    }
    fileInputRef.current.files = dt.files;
  }, [items]);

  useEffect(() => {
    return () => {
      for (const item of items) {
        if (item.file) URL.revokeObjectURL(item.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          });
        }
      } catch (error) {
        errors.push(error instanceof ImageOptimizeError ? error.message : `"${file.name}": no se pudo procesar.`);
      }

      setProcessing({ done: index + 1, total: picked.length });
    }

    setFileErrors(errors);
    setItems((current) => [...current, ...next]);
    setProcessing(null);
  }

  function removeItem(key: string) {
    setItems((current) => {
      const target = current.find((item) => item.key === key);
      if (target?.file) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.key !== key);
    });
  }

  function move(key: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function setAsCover(key: string) {
    setItems((current) => {
      const index = current.findIndex((item) => item.key === key);
      if (index <= 0) return current;
      const next = [...current];
      const [target] = next.splice(index, 1);
      next.unshift(target);
      return next;
    });
  }

  function updateAlt(key: string, alt: string) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, alt } : item)));
  }

  const manifest = items.map((item) => ({
    url: item.file ? null : item.url,
    alt: item.alt,
    isNew: Boolean(item.file),
  }));

  return (
    <div>
      <input type="hidden" name="imagesManifest" value={JSON.stringify(manifest)} readOnly />
      <input ref={fileInputRef} type="file" name="imageFiles" multiple accept={ACCEPT_ATTR} className="hidden" />

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.key} className="overflow-hidden rounded-xl border border-grafito/10 bg-plata">
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
              </div>
              <div className="space-y-2 p-2.5">
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
}
