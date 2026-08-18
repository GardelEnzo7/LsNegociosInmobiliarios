"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireStaff } from "@/lib/supabase/guards";

export type DocumentFormState = { error?: string };

const DOC_BUCKET = "property-documents";
const MAX_DOCUMENT_BYTES = 900 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const documentTypeSchema = z.enum(["escritura", "planos", "contrato", "autorizacion", "impuestos", "otro"]);

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPropertyDocument(
  propertyId: string,
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const file = formData.get("file");
  const parsedDocType = documentTypeSchema.safeParse(formData.get("docType") || "otro");
  const notes = String(formData.get("notes") || "").trim().slice(0, 2000);

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí un archivo para subir." };
  }
  if (!parsedDocType.success) {
    return { error: "Elegí un tipo de documento válido." };
  }
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return { error: "Formato no permitido. Usá PDF, JPG, PNG o WebP." };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { error: "El archivo supera el máximo actual de 900 KB." };
  }

  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para subir documentos." };
  }

  const supabase = await createClient();
  const profileId = await supabase.rpc("current_admin_profile_id");
  if (!profileId.data) {
    return { error: "No se pudo identificar tu usuario. Volvé a iniciar sesión." };
  }

  const docType = parsedDocType.data;
  const path = `${propertyId}/${docType}/${Date.now()}-${sanitizeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(DOC_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
  });

  if (uploadError) {
    return { error: "No se pudo subir el archivo." };
  }

  const { error: insertError } = await supabase.from("property_documents").insert({
    property_id: propertyId,
    doc_type: docType,
    file_path: path,
    uploaded_by: profileId.data,
    notes: notes || null,
  });

  if (insertError) {
    await supabase.storage.from(DOC_BUCKET).remove([path]);
    return { error: "No se pudo registrar el documento." };
  }

  revalidatePath(`/admin/propiedades/${propertyId}`);
  return {};
}

export async function getDocumentSignedUrl(filePath: string): Promise<string | null> {
  await requireStaff();
  const supabase = await createClient();
  const { data } = await supabase.storage.from(DOC_BUCKET).createSignedUrl(filePath, 60);
  return data?.signedUrl ?? null;
}

export async function deletePropertyDocument(
  id: string,
  propertyId: string,
  filePath: string,
): Promise<{ error?: string }> {
  // Deleting the Storage object is admin-only per bucket policy; matching
  // that here (instead of letting a staff-level call silently fail on the
  // storage step below and still remove the DB row) keeps the two in sync.
  await requireAdmin();

  const supabase = await createClient();
  const { error: storageError } = await supabase.storage.from(DOC_BUCKET).remove([filePath]);
  if (storageError) {
    return { error: "No se pudo eliminar el archivo del almacenamiento." };
  }

  const { error: dbError } = await supabase.from("property_documents").delete().eq("id", id);
  if (dbError) {
    return { error: "El archivo se borró pero no se pudo actualizar el registro. Recargá la página." };
  }

  revalidatePath(`/admin/propiedades/${propertyId}`);
  return {};
}
