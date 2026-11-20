"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/supabase/guards";

const contactSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(2, "Ingresá el nombre.").max(200),
  phone: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Ingresá un email válido.").max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type ContactEditState = { error?: string; saved?: boolean };

export async function updateContact(_prev: ContactEditState, formData: FormData): Promise<ContactEditState> {
  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para editar contactos." };
  }

  const parsed = contactSchema.safeParse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los campos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .update({
      full_name: parsed.data.fullName,
      contact_phone: parsed.data.phone || null,
      contact_email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: "No se pudo guardar el contacto." };

  revalidatePath("/admin/contactos");
  revalidatePath("/admin/administraciones", "layout");
  return { saved: true };
}
