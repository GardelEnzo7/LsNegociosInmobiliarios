"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertPropertyListing(
  propertyId: string,
  channel: string,
  fields: { status: string; externalUrl?: string; notes?: string },
) {
  const supabase = await createClient();
  await supabase.from("property_listings").upsert(
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
  revalidatePath(`/admin/propiedades/${propertyId}`);
}
