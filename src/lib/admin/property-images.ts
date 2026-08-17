import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export const PROPERTY_IMAGES_BUCKET = "property-images";
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class ImageUploadError extends Error {}

/** Uploads directly to Supabase Storage — called from the browser (staff
 * session) so multi-MB image bytes never transit through a Netlify
 * function. Uses the Web Crypto API (not Node's `crypto` module) so this
 * module works unchanged in both the browser bundle and server actions. */
export async function uploadPropertyImage(
  supabase: SupabaseClient<Database>,
  propertyId: string,
  file: File,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageUploadError(`Formato no permitido: ${file.type || "desconocido"}.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageUploadError(`"${file.name}" supera el tamaño máximo de 8MB.`);
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(PROPERTY_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new ImageUploadError(`No se pudo subir "${file.name}".`);
  }

  return supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Deletes storage objects for URLs that belong to our own bucket; silently
 * ignores externally-hosted URLs (e.g. legacy Unsplash links) since there is
 * nothing of ours to clean up for those. */
export async function deleteStorageImagesByUrls(supabase: SupabaseClient<Database>, urls: string[]) {
  const marker = `/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`;
  const paths = urls
    .filter((url) => url.includes(marker))
    .map((url) => url.slice(url.indexOf(marker) + marker.length));

  if (paths.length === 0) return;
  await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove(paths);
}

/** Deletes every object under `${propertyId}/` in the bucket, regardless of
 * what `property_images` currently references. Used on property deletion so
 * uploads that never made it into a saved manifest (e.g. the user closed the
 * tab mid-upload) don't linger as orphans. */
export async function deleteStorageImagesByPropertyId(supabase: SupabaseClient<Database>, propertyId: string) {
  const { data: files } = await supabase.storage.from(PROPERTY_IMAGES_BUCKET).list(propertyId, { limit: 1000 });
  if (!files || files.length === 0) return;

  const paths = files.map((file) => `${propertyId}/${file.name}`);
  await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove(paths);
}
