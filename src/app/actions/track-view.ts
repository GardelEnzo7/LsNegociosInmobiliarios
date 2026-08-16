"use server";

import { createClient } from "@/lib/supabase/server";

export async function incrementPropertyViews(propertyId: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_property_views", { property_id: propertyId });
}
