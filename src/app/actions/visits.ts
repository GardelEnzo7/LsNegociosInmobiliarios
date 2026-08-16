"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";

const visitSchema = z.object({
  propertyId: z.string().uuid("Elegí una propiedad."),
  contactId: z.string().uuid("Elegí un cliente."),
  assignedTo: z.string().uuid().optional().or(z.literal("")),
  scheduledAt: z.string().min(1, "Ingresá fecha y hora."),
  notes: z.string().trim().optional(),
});

export type VisitFormState = { error?: string };

export async function createVisit(_prevState: VisitFormState, formData: FormData): Promise<VisitFormState> {
  const parsed = visitSchema.safeParse({
    propertyId: formData.get("propertyId"),
    contactId: formData.get("contactId"),
    assignedTo: formData.get("assignedTo") || undefined,
    scheduledAt: formData.get("scheduledAt"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los campos." };
  }

  const supabase = await createClient();
  const { data: visit, error } = await supabase
    .from("visits")
    .insert({
      property_id: parsed.data.propertyId,
      contact_id: parsed.data.contactId,
      assigned_to: parsed.data.assignedTo || null,
      scheduled_at: new Date(parsed.data.scheduledAt).toISOString(),
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error || !visit) {
    return { error: "No se pudo programar la visita." };
  }

  await logActivity(
    {
      entityType: "visit",
      entityId: visit.id,
      eventType: "visit_created",
      description: "Se programó una nueva visita",
    },
    supabase,
  );

  revalidatePath("/admin/visitas");
  revalidatePath("/admin");
  return {};
}

export async function updateVisitStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("visits").update({ status }).eq("id", id);

  if (status === "realizada" || status === "cancelada") {
    await logActivity(
      {
        entityType: "visit",
        entityId: id,
        eventType: status === "realizada" ? "visit_completed" : "visit_cancelled",
        description: status === "realizada" ? "Visita marcada como realizada" : "Visita cancelada",
      },
      supabase,
    );
  }

  revalidatePath("/admin/visitas");
  revalidatePath("/admin");
}

export async function rescheduleVisit(id: string, scheduledAt: string) {
  const supabase = await createClient();
  await supabase
    .from("visits")
    .update({ scheduled_at: new Date(scheduledAt).toISOString(), status: "reprogramada" })
    .eq("id", id);
  revalidatePath("/admin/visitas");
  revalidatePath("/admin");
}

export async function deleteVisit(id: string) {
  const supabase = await createClient();
  await supabase.from("visits").delete().eq("id", id);
  revalidatePath("/admin/visitas");
  revalidatePath("/admin");
}
