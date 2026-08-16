"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";
import { AVAILABILITY_LABELS } from "@/lib/admin/constants";

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
  m2Total: z.coerce.number().optional().or(z.nan()),
  m2Covered: z.coerce.number().optional().or(z.nan()),
  bedrooms: z.coerce.number().optional().or(z.nan()),
  bathrooms: z.coerce.number().optional().or(z.nan()),
  description: z.string().trim().min(10),
  status: z.enum(["published", "draft"]),
  availability: z.enum(["disponible", "reservada", "vendida", "alquilada"]),
  featured: z.coerce.boolean().optional(),
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
    m2Total: formData.get("m2Total") || undefined,
    m2Covered: formData.get("m2Covered") || undefined,
    bedrooms: formData.get("bedrooms") || undefined,
    bathrooms: formData.get("bathrooms") || undefined,
    description: formData.get("description"),
    status: formData.get("status"),
    availability: formData.get("availability"),
    featured: formData.get("featured") === "on",
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

  const imageUrls = formData
    .getAll("imageUrls")
    .map((v) => String(v).trim())
    .filter(Boolean);

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
      m2_total: Number.isFinite(parsed.m2Total) ? parsed.m2Total : null,
      m2_covered: Number.isFinite(parsed.m2Covered) ? parsed.m2Covered : null,
      bedrooms: Number.isFinite(parsed.bedrooms) ? parsed.bedrooms : null,
      bathrooms: Number.isFinite(parsed.bathrooms) ? parsed.bathrooms : null,
      description: parsed.description,
      status: parsed.status,
      availability: parsed.availability,
      featured: parsed.featured ?? false,
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

  if (imageUrls.length > 0) {
    await supabase
      .from("property_images")
      .insert(imageUrls.map((url, index) => ({ property_id: property.id, url, position: index })));
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

  const imageUrls = formData
    .getAll("imageUrls")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("properties")
    .select("price, availability")
    .eq("id", id)
    .maybeSingle();

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
      m2_total: Number.isFinite(parsed.m2Total) ? parsed.m2Total : null,
      m2_covered: Number.isFinite(parsed.m2Covered) ? parsed.m2Covered : null,
      bedrooms: Number.isFinite(parsed.bedrooms) ? parsed.bedrooms : null,
      bathrooms: Number.isFinite(parsed.bathrooms) ? parsed.bathrooms : null,
      description: parsed.description,
      status: parsed.status,
      availability: parsed.availability,
      featured: parsed.featured ?? false,
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo actualizar la propiedad." };
  }

  await supabase.from("property_images").delete().eq("property_id", id);
  if (imageUrls.length > 0) {
    await supabase
      .from("property_images")
      .insert(imageUrls.map((url, index) => ({ property_id: id, url, position: index })));
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
  await supabase.from("properties").delete().eq("id", id);
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
