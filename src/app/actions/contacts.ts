"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";

const ROLE_VALUES = ["interesado", "propietario", "comprador", "inquilino"] as const;

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresá un nombre."),
  contactPhone: z.string().trim().optional(),
  contactEmail: z.string().trim().optional(),
  source: z.string().trim().min(1),
  notes: z.string().trim().optional(),
  roles: z.array(z.enum(ROLE_VALUES)).min(1, "Elegí al menos un rol."),
});

export type ContactFormState = { error?: string };

export async function createContact(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    fullName: formData.get("fullName"),
    contactPhone: formData.get("contactPhone") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    source: formData.get("source") || "web",
    notes: formData.get("notes") || undefined,
    roles: formData.getAll("roles"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los campos del formulario." };
  }

  const propertyIds = formData.getAll("propertyIds").map(String).filter(Boolean);

  const supabase = await createClient();
  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      full_name: parsed.data.fullName,
      contact_phone: parsed.data.contactPhone || null,
      contact_email: parsed.data.contactEmail || null,
      source: parsed.data.source,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error || !contact) {
    return { error: "No se pudo crear el cliente." };
  }

  await supabase
    .from("contact_roles")
    .insert(parsed.data.roles.map((role) => ({ contact_id: contact.id, role })));

  if (propertyIds.length > 0) {
    await supabase
      .from("contact_properties")
      .insert(propertyIds.map((propertyId) => ({ contact_id: contact.id, property_id: propertyId })));
  }

  await logActivity(
    {
      entityType: "contact",
      entityId: contact.id,
      eventType: "contact_created",
      description: `Se creó el cliente "${parsed.data.fullName}"`,
    },
    supabase,
  );

  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function updateContactNotes(id: string, notes: string) {
  const supabase = await createClient();
  await supabase.from("contacts").update({ notes: notes || null }).eq("id", id);
  revalidatePath(`/admin/clientes/${id}`);
}

export async function addContactRole(id: string, role: (typeof ROLE_VALUES)[number]) {
  const supabase = await createClient();
  await supabase.from("contact_roles").insert({ contact_id: id, role }).select().maybeSingle();
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/clientes");
}

export async function removeContactRole(id: string, role: string) {
  const supabase = await createClient();
  await supabase.from("contact_roles").delete().eq("contact_id", id).eq("role", role);
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/clientes");
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  await supabase.from("contacts").delete().eq("id", id);
  revalidatePath("/admin/clientes");
}

export async function linkContactToInquiry(inquiryId: string, contactId: string) {
  const supabase = await createClient();
  await supabase.from("inquiries").update({ contact_id: contactId }).eq("id", inquiryId);
  revalidatePath("/admin/mensajes");
}
