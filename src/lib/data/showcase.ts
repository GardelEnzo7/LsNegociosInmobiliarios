import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export async function getAgencyProfile(): Promise<Tables<"agency_profile"> | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("agency_profile").select("*").eq("id", 1).maybeSingle();
  return data;
}
