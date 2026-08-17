/**
 * Browser-side image optimization for the property photo uploader. Runs
 * entirely on native APIs (createImageBitmap + Canvas) — no dependency,
 * since canvas.toBlob("image/webp") has broad support in every evergreen
 * browser (Chrome/Edge/Firefox/Safari 14+) and covers the whole brief:
 * downscale, re-encode to WebP, and skip work when it's not needed.
 */

export const IMAGE_OPTIMIZE_DEFAULTS = {
  maxWidth: 1920,
  quality: 0.82,
  // A WebP already at/under this size and within maxWidth is treated as
  // "reasonably optimized" and passed through untouched.
  skipReencodeMaxBytes: 1.5 * 1024 * 1024,
};

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
};

export class ImageOptimizeError extends Error {}

function stripExtension(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, "");
  return base || "foto";
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImageOptimizeError("No se pudo procesar la imagen."))),
      type,
      quality,
    );
  });
}

/**
 * Downscales to `maxWidth` (preserving aspect ratio, never upscales),
 * re-encodes to WebP at `quality`, and returns a new .webp File. Skips
 * re-encoding entirely when the source is already a small-enough WebP.
 *
 * Relies on createImageBitmap to decode — this is also what gives HEIC/HEIF
 * a chance: browsers that can decode it (e.g. Safari) go through the exact
 * same path for free; browsers that can't reject here with a clear error,
 * no dedicated HEIC library needed.
 */
export async function optimizeImageFile(
  file: File,
  opts: Partial<typeof IMAGE_OPTIMIZE_DEFAULTS> = {},
): Promise<File> {
  const { maxWidth, quality, skipReencodeMaxBytes } = { ...IMAGE_OPTIMIZE_DEFAULTS, ...opts };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageOptimizeError(
      `"${file.name}": el navegador no pudo abrir esta imagen (formato no soportado o archivo dañado).`,
    );
  }

  try {
    const alreadyOptimized =
      file.type === "image/webp" && file.size <= skipReencodeMaxBytes && bitmap.width <= maxWidth;
    if (alreadyOptimized) return file;

    const scale = Math.min(1, maxWidth / bitmap.width);
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new ImageOptimizeError("Tu navegador no puede procesar imágenes en este momento.");
    }
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, "image/webp", quality);
    // Extremely old/unsupported browsers silently fall back to PNG when the
    // requested type isn't available — still resized, still a valid upload.
    const extension = EXTENSION_BY_MIME[blob.type] ?? "webp";

    return new File([blob], `${stripExtension(file.name)}.${extension}`, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
