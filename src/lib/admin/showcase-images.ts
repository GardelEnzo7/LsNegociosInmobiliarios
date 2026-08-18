import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export const SHOWCASE_IMAGES_BUCKET = "showcase-images";
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class ShowcaseImageUploadError extends Error {}

/** Uploads directly to the `showcase-images` bucket — separate from
 * property-images (different content, different lifecycle) and from the
 * private property-documents bucket. Currently only used for the founder's
 * photo (`folder: "profile"`); `folder` stays generic in case another kind
 * of institutional image needs its own namespace later. */
export async function uploadShowcaseImage(
  supabase: SupabaseClient<Database>,
  folder: string,
  file: File,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ShowcaseImageUploadError(`Formato no permitido: ${file.type || "desconocido"}.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ShowcaseImageUploadError(`"${file.name}" supera el tamaño máximo de 8MB.`);
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(SHOWCASE_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new ShowcaseImageUploadError(`No se pudo subir "${file.name}".`);
  }

  return supabase.storage.from(SHOWCASE_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Deletes one previously-uploaded showcase image by its public URL;
 * silently ignores URLs that aren't in our own bucket. */
export async function deleteShowcaseImageByUrl(supabase: SupabaseClient<Database>, url: string) {
  const marker = `/storage/v1/object/public/${SHOWCASE_IMAGES_BUCKET}/`;
  if (!url.includes(marker)) return;
  const path = url.slice(url.indexOf(marker) + marker.length);
  await supabase.storage.from(SHOWCASE_IMAGES_BUCKET).remove([path]);
}
