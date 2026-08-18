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

// Deliberately no `deleteStorageImagesByUrls`/`ByPropertyId` here anymore:
// Storage cleanup for this bucket never runs synchronously as part of a
// property save/delete (see syncPropertyImages/deleteProperty in
// src/app/actions/properties.ts for why — Postgres and Storage are two
// different systems, so a "delete right after sync" here can only narrow a
// race between concurrent saves, never close it). The only code that
// removes objects from this bucket now is the separate, manual, admin-only
// cleanup in src/app/actions/property-images-cleanup.ts.
