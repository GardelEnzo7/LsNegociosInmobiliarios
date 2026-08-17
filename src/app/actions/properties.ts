"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";
import { AVAILABILITY_LABELS } from "@/lib/admin/constants";
import { deleteStorageImagesByUrls, uploadPropertyImage } from "@/lib/admin/property-images";
import type { Database } from "@/lib/supabase/types";

const imageManifestSchema = z.array(
  z.object({
    url: z.string().nullable(),
    alt: z.string().trim().max(200).default(""),
    isNew: z.boolean().default(false),
  }),
);

/** Resolves the final ordered set of property images from the submitted
 * manifest: existing entries keep their URL, "new" entries are matched
 * positionally against the uploaded files and pushed to Storage. A file
 * that fails validation/upload is skipped rather than aborting the whole
 * property save. */
async function resolveImages(
  supabase: SupabaseClient<Database>,
  propertyId: string,
  formData: FormData,
): Promise<{ url: string; alt: string }[]> {
  const raw = formData.get("imagesManifest");
  if (typeof raw !== "string" || !raw) return [];

  let manifest: z.infer<typeof imageManifestSchema>;
  try {
    manifest = imageManifestSchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }

  const files = formData.getAll("imageFiles").filter((f): f is File => f instanceof File && f.size > 0);
  let fileIndex = 0;
  const resolved: { url: string; alt: string }[] = [];

  for (const item of manifest) {
    if (item.isNew) {
      const file = files[fileIndex++];
      if (!file) continue;
      try {
        const url = await uploadPropertyImage(supabase, propertyId, file);
        resolved.push({ url, alt: item.alt });
      } catch {
        // Best-effort: skip files that fail validation/upload, keep the rest.
      }
    } else if (item.url) {
      resolved.push({ url: item.url, alt: item.alt });
    }
  }

  return resolved;
}

const propertySchema = z.object({
  title: z.string().trim().min(3),
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones."),
  operation: z.enum(["venta", "alquiler"]),
  propertyType: z.enum(["casa", "departamento", "ph", "terreno", "local", "oficina"]),
  price: z.coerce.number().min(0),
  currency: z.enum(["USD", "ARS"]),
  neighborhood: z.string().trim().min(2),
  address: z.string().trim().optional(),
  lat: z.coerce.number().min(-90).max(90).optional().or(z.nan()),
  lng: z.coerce.number().min(-180).max(180).optional().or(z.nan()),
  m2Total: z.coerce.number().optional().or(z.nan()),
  m2Covered: z.coerce.number().optional().or(z.nan()),
  bedrooms: z.coerce.number().optional().or(z.nan()),
  bathrooms: z.coerce.number().optional().or(z.nan()),
  description: z.string().trim().min(10),
  status: z.enum(["published", "draft"]),
  availability: z.enum(["disponible", "reservada", "vendida", "alquilada"]),
  featured: z.coerce.boolean().optional(),
  yearBuilt: z.coerce.number().optional().or(z.nan()),
  hasGarage: z.coerce.boolean().optional(),
  expenses: z.coerce.number().min(0).optional().or(z.nan()),
  orientation: z
    .enum(["norte", "sur", "este", "oeste", "noreste", "noroeste", "sureste", "suroeste", ""])
    .optional(),
  creditEligible: z.coerce.boolean().optional(),
  professionalUse: z.coerce.boolean().optional(),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(160).optional(),
});

export type PropertyFormState = { error?: string };

function parseForm(formData: FormData) {
  return propertySchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    operation: formData.get("operation"),
    propertyType: formData.get("propertyType"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    neighborhood: formData.get("neighborhood"),
    address: formData.get("address") || undefined,
    lat: formData.get("lat") || undefined,
    lng: formData.get("lng") || undefined,
    m2Total: formData.get("m2Total") || undefined,
    m2Covered: formData.get("m2Covered") || undefined,
    bedrooms: formData.get("bedrooms") || undefined,
    bathrooms: formData.get("bathrooms") || undefined,
    description: formData.get("description"),
    status: formData.get("status"),
    availability: formData.get("availability"),
    featured: formData.get("featured") === "on",
    yearBuilt: formData.get("yearBuilt") || undefined,
    hasGarage: formData.get("hasGarage") === "on",
    expenses: formData.get("expenses") || undefined,
    orientation: formData.get("orientation") || "",
    creditEligible: formData.get("creditEligible") === "on",
    professionalUse: formData.get("professionalUse") === "on",
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
  });
}

export async function createProperty(
  _prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  let parsed;
  try {
    parsed = parseForm(formData);
  } catch {
    return { error: "Revisá los campos: hay datos inválidos o faltantes." };
  }

  const supabase = await createClient();
  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      title: parsed.title,
      slug: parsed.slug,
      operation: parsed.operation,
      property_type: parsed.propertyType,
      price: parsed.price,
      currency: parsed.currency,
      neighborhood: parsed.neighborhood,
      address: parsed.address || null,
      lat: Number.isFinite(parsed.lat) ? parsed.lat : null,
      lng: Number.isFinite(parsed.lng) ? parsed.lng : null,
      m2_total: Number.isFinite(parsed.m2Total) ? parsed.m2Total : null,
      m2_covered: Number.isFinite(parsed.m2Covered) ? parsed.m2Covered : null,
      bedrooms: Number.isFinite(parsed.bedrooms) ? parsed.bedrooms : null,
      bathrooms: Number.isFinite(parsed.bathrooms) ? parsed.bathrooms : null,
      description: parsed.description,
      status: parsed.status,
      availability: parsed.availability,
      featured: parsed.featured ?? false,
      year_built: Number.isFinite(parsed.yearBuilt) ? parsed.yearBuilt : null,
      has_garage: parsed.hasGarage ?? false,
      expenses: Number.isFinite(parsed.expenses) ? parsed.expenses : null,
      orientation: parsed.orientation || null,
      credit_eligible: parsed.creditEligible ?? false,
      professional_use: parsed.professionalUse ?? false,
      meta_title: parsed.metaTitle || null,
      meta_description: parsed.metaDescription || null,
    })
    .select("id")
    .single();

  if (error || !property) {
    return {
      error: error?.message.includes("duplicate")
        ? "Ya existe una propiedad con ese slug."
        : "No se pudo crear la propiedad.",
    };
  }

  const images = await resolveImages(supabase, property.id, formData);
  if (images.length > 0) {
    await supabase.from("property_images").insert(
      images.map((img, index) => ({ property_id: property.id, url: img.url, alt: img.alt, position: index })),
    );
  }

  await logActivity(
    {
      entityType: "property",
      entityId: property.id,
      eventType: "property_created",
      description: `Se creó la propiedad "${parsed.title}"`,
    },
    supabase,
  );

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");
  revalidatePath("/");
  redirect("/admin/propiedades");
}

export async function updateProperty(
  id: string,
  _prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  let parsed;
  try {
    parsed = parseForm(formData);
  } catch {
    return { error: "Revisá los campos: hay datos inválidos o faltantes." };
  }

  const supabase = await createClient();

  const [{ data: before }, { data: existingImages }] = await Promise.all([
    supabase.from("properties").select("price, availability").eq("id", id).maybeSingle(),
    supabase.from("property_images").select("url").eq("property_id", id),
  ]);

  const { error } = await supabase
    .from("properties")
    .update({
      title: parsed.title,
      slug: parsed.slug,
      operation: parsed.operation,
      property_type: parsed.propertyType,
      price: parsed.price,
      currency: parsed.currency,
      neighborhood: parsed.neighborhood,
      address: parsed.address || null,
      lat: Number.isFinite(parsed.lat) ? parsed.lat : null,
      lng: Number.isFinite(parsed.lng) ? parsed.lng : null,
      m2_total: Number.isFinite(parsed.m2Total) ? parsed.m2Total : null,
      m2_covered: Number.isFinite(parsed.m2Covered) ? parsed.m2Covered : null,
      bedrooms: Number.isFinite(parsed.bedrooms) ? parsed.bedrooms : null,
      bathrooms: Number.isFinite(parsed.bathrooms) ? parsed.bathrooms : null,
      description: parsed.description,
      status: parsed.status,
      availability: parsed.availability,
      featured: parsed.featured ?? false,
      year_built: Number.isFinite(parsed.yearBuilt) ? parsed.yearBuilt : null,
      has_garage: parsed.hasGarage ?? false,
      expenses: Number.isFinite(parsed.expenses) ? parsed.expenses : null,
      orientation: parsed.orientation || null,
      credit_eligible: parsed.creditEligible ?? false,
      professional_use: parsed.professionalUse ?? false,
      meta_title: parsed.metaTitle || null,
      meta_description: parsed.metaDescription || null,
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo actualizar la propiedad." };
  }

  const images = await resolveImages(supabase, id, formData);

  await supabase.from("property_images").delete().eq("property_id", id);
  if (images.length > 0) {
    await supabase.from("property_images").insert(
      images.map((img, index) => ({ property_id: id, url: img.url, alt: img.alt, position: index })),
    );
  }

  const keptUrls = new Set(images.map((img) => img.url));
  const removedUrls = (existingImages ?? []).map((row) => row.url).filter((url) => !keptUrls.has(url));
  if (removedUrls.length > 0) {
    await deleteStorageImagesByUrls(supabase, removedUrls);
  }

  if (before && before.price !== parsed.price) {
    await logActivity(
      {
        entityType: "property",
        entityId: id,
        eventType: "price_changed",
        description: `Precio actualizado de ${before.price} a ${parsed.price} en "${parsed.title}"`,
        metadata: { from: before.price, to: parsed.price },
      },
      supabase,
    );
  } else {
    await logActivity(
      {
        entityType: "property",
        entityId: id,
        eventType: "property_updated",
        description: `Se editó la propiedad "${parsed.title}"`,
      },
      supabase,
    );
  }

  if (before && before.availability !== parsed.availability) {
    await logActivity(
      {
        entityType: "property",
        entityId: id,
        eventType: "availability_changed",
        description: `Estado comercial de "${parsed.title}" pasó a ${AVAILABILITY_LABELS[parsed.availability]}`,
        metadata: { from: before.availability, to: parsed.availability },
      },
      supabase,
    );
    if (parsed.availability === "vendida" || parsed.availability === "alquilada") {
      await logActivity(
        {
          entityType: "property",
          entityId: id,
          eventType: "deal_closed",
          description: `Operación cerrada: "${parsed.title}" (${AVAILABILITY_LABELS[parsed.availability]})`,
        },
        supabase,
      );
    }
  }

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");
  revalidatePath(`/propiedades/${parsed.slug}`);
  revalidatePath("/");
  redirect("/admin/propiedades");
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const { data: images } = await supabase.from("property_images").select("url").eq("property_id", id);
  await supabase.from("properties").delete().eq("id", id);
  if (images && images.length > 0) {
    await deleteStorageImagesByUrls(supabase, images.map((row) => row.url));
  }
  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");
  revalidatePath("/");
}

export async function toggleFeatured(id: string, featured: boolean) {
  const supabase = await createClient();
  await supabase.from("properties").update({ featured }).eq("id", id);
  revalidatePath("/admin/propiedades");
  revalidatePath("/");
}

export async function updateAvailability(id: string, availability: string) {
  const supabase = await createClient();
  const { data: before } = await supabase
    .from("properties")
    .select("title, availability")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("properties").update({ availability }).eq("id", id);

  if (before && before.availability !== availability) {
    await logActivity(
      {
        entityType: "property",
        entityId: id,
        eventType: "availability_changed",
        description: `Estado comercial de "${before.title}" pasó a ${AVAILABILITY_LABELS[availability]}`,
        metadata: { from: before.availability, to: availability },
      },
      supabase,
    );
    if (availability === "vendida" || availability === "alquilada") {
      await logActivity(
        {
          entityType: "property",
          entityId: id,
          eventType: "deal_closed",
          description: `Operación cerrada: "${before.title}" (${AVAILABILITY_LABELS[availability]})`,
        },
        supabase,
      );
    }
  }

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");
}
