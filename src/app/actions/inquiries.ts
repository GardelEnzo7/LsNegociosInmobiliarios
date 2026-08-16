"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";
import { INQUIRY_STATUS_LABELS } from "@/lib/admin/constants";

export async function updateInquiryStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("inquiries").update({ status }).eq("id", id);

  await logActivity(
    {
      entityType: "inquiry",
      entityId: id,
      eventType: "inquiry_status_changed",
      description: `Consulta actualizada a "${INQUIRY_STATUS_LABELS[status] ?? status}"`,
      metadata: { to: status },
    },
    supabase,
  );

  revalidatePath("/admin/mensajes");
  revalidatePath("/admin");
}

export async function assignInquiry(id: string, assignedTo: string | null) {
  const supabase = await createClient();
  await supabase.from("inquiries").update({ assigned_to: assignedTo || null }).eq("id", id);
  revalidatePath("/admin/mensajes");
}

export async function updateInquiryNotes(id: string, notes: string) {
  const supabase = await createClient();
  await supabase.from("inquiries").update({ internal_notes: notes || null }).eq("id", id);
  revalidatePath("/admin/mensajes");
}

export async function deleteInquiry(id: string) {
  const supabase = await createClient();
  await supabase.from("inquiries").delete().eq("id", id);
  revalidatePath("/admin/mensajes");
}

export async function convertInquiryToContact(inquiryId: string) {
  const supabase = await createClient();
  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("id, contact_id, message:messages(name, contact)")
    .eq("id", inquiryId)
    .maybeSingle();

  if (!inquiry || inquiry.contact_id || !inquiry.message) return;

  const isEmail = inquiry.message.contact.includes("@");
  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      full_name: inquiry.message.name,
      contact_email: isEmail ? inquiry.message.contact : null,
      contact_phone: isEmail ? null : inquiry.message.contact,
      source: "mensaje del sitio",
    })
    .select("id")
    .single();

  if (error || !contact) return;

  await supabase.from("contact_roles").insert({ contact_id: contact.id, role: "interesado" });
  await supabase.from("inquiries").update({ contact_id: contact.id }).eq("id", inquiryId);

  await logActivity(
    {
      entityType: "contact",
      entityId: contact.id,
      eventType: "contact_created",
      description: `Se creó el cliente "${inquiry.message.name}" a partir de una consulta`,
    },
    supabase,
  );

  revalidatePath("/admin/mensajes");
  revalidatePath("/admin/clientes");
}
