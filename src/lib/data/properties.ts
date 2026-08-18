import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Property = Tables<"properties">;
export type PropertyImage = Tables<"property_images">;
export type PropertyWithImages = Property & { property_images: PropertyImage[] };

export type PropertyFilters = {
  operation?: string;
  propertyType?: string;
  neighborhood?: string;
  currency?: string;
  priceMin?: number;
  priceMax?: number;
  query?: string;
};

export type PriceRange = { min: number; max: number };
export type PriceRangesByCurrency = { USD: PriceRange | null; ARS: PriceRange | null };

/** Thrown only for genuine Supabase/infra failures (never for "0 rows") so
 * the nearest `error.tsx` can show a real error state instead of the page
 * silently rendering an empty/"not found" result as if that were the truth. */
export class PropertyFetchError extends Error {}

export async function getFeaturedProperties(): Promise<PropertyWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) throw new PropertyFetchError("No se pudieron cargar las propiedades destacadas.");
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
  if (filters.currency) query = query.eq("currency", filters.currency);
  if (filters.priceMin != null) query = query.gte("price", filters.priceMin);
  if (filters.priceMax != null) query = query.lte("price", filters.priceMax);
  if (filters.query) {
    // Strip characters with special meaning in PostgREST's filter syntax
    // (comma separates OR clauses, parens group them, % is the ILIKE wildcard)
    // so a search term can't malform or manipulate the query we build below.
    const term = filters.query.trim().replace(/[,()%]/g, "");
    if (term) {
      query = query.or(`title.ilike.%${term}%,address.ilike.%${term}%,neighborhood.ilike.%${term}%`);
    }
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new PropertyFetchError("No se pudieron cargar las propiedades.");
  return (data ?? []).map(sortImages);
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  // Only a real (no-error) empty result means "not found" — an infra/query
  // error must never be treated the same as a missing property (false 404).
  if (error) throw new PropertyFetchError("No se pudo cargar la propiedad.");
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

export async function getPublishedPropertySlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("status", "published");

  return (data ?? []).map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
}

export async function getClosedPropertiesCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .in("availability", ["vendida", "alquilada"]);

  return count ?? 0;
}

/** Real min/max price per currency across published, priced properties —
 * computed once (cheap: only price+currency columns) and reused as the
 * slider's stable bounds. Never recomputed while the user drags the slider,
 * only on page load. */
export async function getPriceRangesByCurrency(): Promise<PriceRangesByCurrency> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("price, currency")
    .eq("status", "published")
    .gt("price", 0);

  const ranges: PriceRangesByCurrency = { USD: null, ARS: null };
  for (const row of data ?? []) {
    if (row.currency !== "USD" && row.currency !== "ARS") continue;
    const current = ranges[row.currency];
    if (!current) {
      ranges[row.currency] = { min: row.price, max: row.price };
    } else {
      current.min = Math.min(current.min, row.price);
      current.max = Math.max(current.max, row.price);
    }
  }

  return ranges;
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
