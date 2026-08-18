"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/supabase/guards";

export async function upsertPropertyListing(
  propertyId: string,
  channel: string,
  fields: { status: string; externalUrl?: string; notes?: string },
): Promise<{ error?: string }> {
  await requireStaff();

  const supabase = await createClient();
  const { error } = await supabase.from("property_listings").upsert(
    {
      property_id: propertyId,
      channel,
      status: fields.status,
      external_url: fields.externalUrl || null,
      notes: fields.notes || null,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "property_id,channel" },
  );

  if (error) {
    return { error: "No se pudo guardar la difusión." };
  }

  revalidatePath(`/admin/propiedades/${propertyId}`);
  return {};
}
