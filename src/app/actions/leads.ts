"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMessageById } from "@/lib/data/admin";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Ingresá un nombre."),
  contactPhone: z.string().trim().optional(),
  contactEmail: z.string().trim().optional(),
  source: z.string().trim().min(1),
  notes: z.string().trim().optional(),
});

export type LeadFormState = { error?: string };

export async function createLead(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    contactPhone: formData.get("contactPhone") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    source: formData.get("source") || "web",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Revisá los campos: falta el nombre." };
  }

  const propertyIds = formData.getAll("propertyIds").map(String).filter(Boolean);

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: parsed.data.name,
      contact_phone: parsed.data.contactPhone || null,
      contact_email: parsed.data.contactEmail || null,
      source: parsed.data.source,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error || !lead) {
    return { error: "No se pudo crear el cliente." };
  }

  if (propertyIds.length > 0) {
    await supabase
      .from("lead_properties")
      .insert(propertyIds.map((propertyId) => ({ lead_id: lead.id, property_id: propertyId })));
  }

  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/clientes");
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin/clientes");
}

export async function convertMessageToLead(messageId: string) {
  const message = await getMessageById(messageId);
  if (!message) return;

  const isEmail = message.contact.includes("@");
  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: message.name,
      contact_email: isEmail ? message.contact : null,
      contact_phone: isEmail ? null : message.contact,
      source: "mensaje del sitio",
      notes: message.message,
    })
    .select("id")
    .single();

  if (!error && lead && message.property_id) {
    await supabase
      .from("lead_properties")
      .insert({ lead_id: lead.id, property_id: message.property_id });
  }

  await supabase.from("messages").update({ read: true }).eq("id", messageId);

  revalidatePath("/admin/clientes");
  revalidatePath("/admin/mensajes");
  redirect("/admin/clientes");
}
