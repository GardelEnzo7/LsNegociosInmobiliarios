"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ShowcaseImageUploadError, uploadShowcaseImage } from "@/lib/admin/showcase-images";
import { ImageOptimizeError, optimizeImageFile } from "@/lib/admin/image-optimize";
import { cn } from "@/lib/utils";

/**
 * Single-photo picker: optimizes + uploads straight to the showcase-images
 * bucket on selection (same browser→Storage path as property photos) and
 * carries the resulting URL in a hidden input so it submits with the rest
 * of the form. Much simpler than PropertyImagesManager on purpose — there's
 * exactly one file here, not a reorderable batch.
 */
export function ShowcaseImageField({
  name,
  folder,
  initialUrl,
  disabled,
  onUploadingChange,
}: {
  name: string;
  folder: string;
  initialUrl?: string | null;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pickerId = useId();

  async function handlePick(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    onUploadingChange?.(true);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const optimized = await optimizeImageFile(file);
      const supabase = createClient();
      const uploadedUrl = await uploadShowcaseImage(supabase, folder, optimized);
      setUrl(uploadedUrl);
      setPreviewUrl(uploadedUrl);
    } catch (err) {
      const message =
        err instanceof ShowcaseImageUploadError || err instanceof ImageOptimizeError
          ? err.message
          : "No se pudo subir la imagen.";
      setError(message);
      setPreviewUrl(url);
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-piedra ring-1 ring-grafito/10">
          {previewUrl ? (
            <Image src={previewUrl} alt="" fill unoptimized sizes="80px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-utility text-[9px] uppercase text-grafito/35">
              Sin foto
            </span>
          )}
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-grafito/40">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blanco-roto/40 border-t-blanco-roto" />
            </span>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={pickerId}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-grafito/10 px-3 py-2 text-xs font-medium text-grafito transition-colors duration-150 ease-out hover:bg-piedra/40",
              (disabled || uploading) && "pointer-events-none opacity-50",
            )}
          >
            {url ? "Cambiar imagen" : "Subir imagen"}
          </label>
          <input
            id={pickerId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={disabled || uploading}
            onChange={(event) => {
              handlePick(event.target.files);
              event.target.value = "";
            }}
            className="sr-only"
          />
          {error ? <p className="mt-1.5 text-xs text-terracota">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
