"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const internalSchema = z.object({
  ownerContactId: z.string().uuid().optional().or(z.literal("")),
  assignedTo: z.string().uuid().optional().or(z.literal("")),
  internalNotes: z.string().trim().optional(),
  commission: z.coerce.number().optional().or(z.nan()),
  keysLocation: z.string().trim().optional(),
  visitInstructions: z.string().trim().optional(),
  initialPrice: z.coerce.number().optional().or(z.nan()),
});

export type PropertyInternalFormState = { error?: string; success?: boolean };

export async function upsertPropertyInternal(
  propertyId: string,
  _prevState: PropertyInternalFormState,
  formData: FormData,
): Promise<PropertyInternalFormState> {
  const parsed = internalSchema.safeParse({
    ownerContactId: formData.get("ownerContactId") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
    commission: formData.get("commission") || undefined,
    keysLocation: formData.get("keysLocation") || undefined,
    visitInstructions: formData.get("visitInstructions") || undefined,
    initialPrice: formData.get("initialPrice") || undefined,
  });

  if (!parsed.success) {
    return { error: "Revisá los campos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("property_internal").upsert({
    property_id: propertyId,
    owner_contact_id: parsed.data.ownerContactId || null,
    assigned_to: parsed.data.assignedTo || null,
    internal_notes: parsed.data.internalNotes || null,
    commission: Number.isFinite(parsed.data.commission) ? parsed.data.commission : null,
    keys_location: parsed.data.keysLocation || null,
    visit_instructions: parsed.data.visitInstructions || null,
    initial_price: Number.isFinite(parsed.data.initialPrice) ? parsed.data.initialPrice : null,
  });

  if (error) {
    return { error: "No se pudo guardar la información interna." };
  }

  revalidatePath(`/admin/propiedades/${propertyId}`);
  return { success: true };
}
