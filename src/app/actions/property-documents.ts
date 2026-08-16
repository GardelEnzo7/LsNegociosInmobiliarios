"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/supabase/guards";

export type DocumentFormState = { error?: string };

const DOC_BUCKET = "property-documents";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPropertyDocument(
  propertyId: string,
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const file = formData.get("file");
  const docType = String(formData.get("docType") || "otro");
  const notes = String(formData.get("notes") || "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí un archivo para subir." };
  }

  const supabase = await createClient();
  const profileId = await supabase.rpc("current_admin_profile_id");
  if (!profileId.data) {
    return { error: "No se pudo identificar tu usuario. Volvé a iniciar sesión." };
  }

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

export async function deletePropertyDocument(id: string, propertyId: string, filePath: string) {
  const supabase = await createClient();
  await supabase.storage.from(DOC_BUCKET).remove([filePath]);
  await supabase.from("property_documents").delete().eq("id", id);
  revalidatePath(`/admin/propiedades/${propertyId}`);
}
