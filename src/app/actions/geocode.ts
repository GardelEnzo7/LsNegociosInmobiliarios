"use server";

import { geocodeAddress as lookupAddress, type GeocodeResult } from "@/lib/admin/geocode";
import { requireStaff } from "@/lib/supabase/guards";

export async function geocodePropertyAddress(
  address: string,
  neighborhood: string,
): Promise<GeocodeResult | null> {
  await requireStaff();

  const query = [address, neighborhood, "Rosario, Santa Fe, Argentina"]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  return lookupAddress(query);
}
