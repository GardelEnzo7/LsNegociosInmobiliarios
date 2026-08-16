import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Property = Tables<"properties">;
export type PropertyImage = Tables<"property_images">;
export type PropertyWithImages = Property & { property_images: PropertyImage[] };

export type PropertyFilters = {
  operation?: string;
  propertyType?: string;
  neighborhood?: string;
  priceMax?: number;
  query?: string;
};

export async function getFeaturedProperties(): Promise<PropertyWithImages[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map(sortImages);
}

export async function getProperties(filters: PropertyFilters = {}): Promise<PropertyWithImages[]> {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("status", "published");

  if (filters.operation) query = query.eq("operation", filters.operation);
  if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters.neighborhood) query = query.eq("neighborhood", filters.neighborhood);
  if (filters.priceMax) query = query.lte("price", filters.priceMax);
  if (filters.query) {
    const term = filters.query.trim();
    if (term) {
      query = query.or(`title.ilike.%${term}%,address.ilike.%${term}%,neighborhood.ilike.%${term}%`);
    }
  }

  const { data } = await query.order("created_at", { ascending: false });
  return (data ?? []).map(sortImages);
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithImages | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  return data ? sortImages(data) : null;
}

export async function getSimilarProperties(property: Property): Promise<PropertyWithImages[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("status", "published")
    .eq("neighborhood", property.neighborhood)
    .neq("id", property.id)
    .limit(4);

  return (data ?? []).map(sortImages);
}

export async function getClosedProperties(limit = 3): Promise<PropertyWithImages[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("status", "published")
    .in("availability", ["vendida", "alquilada"])
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map(sortImages);
}

export async function getNeighborhoods(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("neighborhood")
    .eq("status", "published");

  return Array.from(new Set((data ?? []).map((row) => row.neighborhood))).sort();
}

function sortImages(property: PropertyWithImages): PropertyWithImages {
  return {
    ...property,
    property_images: [...property.property_images].sort((a, b) => a.position - b.position),
  };
}
