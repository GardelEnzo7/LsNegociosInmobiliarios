"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";
import { AVAILABILITY_LABELS } from "@/lib/admin/constants";
import { requireAdmin, requireStaff } from "@/lib/supabase/guards";

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

export type PropertyFormState = {
  error?: string;
  propertyId?: string;
  slug?: string;
  /** Only set when this submission created a new property. The row is
   * always inserted as `draft` regardless of what the admin picked (see
   * `savePropertyBase`) — this carries the admin's actual intent so the
   * client can promote it to `published` only after photos finish syncing. */
  intendedStatus?: "published" | "draft";
  /** zod field key -> first error message, for highlighting the exact
   * invalid input client-side (e.g. `{ slug: "Usá minúsculas, números y guiones." }`). */
  fieldMessages?: Record<string, string>;
};

const FIELD_LABELS: Record<string, string> = {
  title: "Título",
  slug: "Slug (URL)",
  operation: "Operación",
  propertyType: "Tipo de propiedad",
  price: "Precio",
  currency: "Moneda",
  neighborhood: "Barrio / zona",
  address: "Dirección",
  lat: "Latitud",
  lng: "Longitud",
  m2Total: "M² totales",
  m2Covered: "M² cubiertos",
  bedrooms: "Dormitorios",
  bathrooms: "Baños",
  description: "Descripción",
  status: "Estado del sitio",
  availability: "Estado de la operación",
  yearBuilt: "Año de construcción",
  expenses: "Expensas",
  orientation: "Orientación",
  metaTitle: "Título SEO",
  metaDescription: "Descripción SEO",
};

/** Thrown by `parseForm` so `savePropertyBase` can tell the admin exactly
 * which fields failed, instead of a generic message. Carries only field
 * keys/labels and zod's own error messages — never raw submitted values —
 * since the caller renders these directly next to each input. */
class PropertyValidationError extends Error {
  constructor(public readonly fields: { key: string; label: string; message: string }[]) {
    super(`Invalid fields: ${fields.map((f) => f.key).join(", ")}`);
  }
}

function parseForm(formData: FormData) {
  const result = propertySchema.safeParse({
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

  if (!result.success) {
    const { fieldErrors } = result.error.flatten();
    const fields = Object.entries(fieldErrors).map(([key, messages]) => ({
      key,
      label: FIELD_LABELS[key] ?? key,
      message: messages?.[0] ?? "Campo inválido.",
    }));
    throw new PropertyValidationError(fields);
  }

  return result.data;
}

/**
 * Persists the non-image property fields only — no file bytes ever pass
 * through this action. Returns the property id/slug instead of redirecting,
 * so the client can run the direct-to-Storage image upload step (see
 * `PropertyImagesManager`) and call `syncPropertyImages` before navigating
 * away. Pass `id: null` to create, an existing id to update.
 */
async function savePropertyBase(
  id: string | null,
  _prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para guardar propiedades." };
  }

  let parsed;
  try {
    parsed = parseForm(formData);
  } catch (err) {
    if (err instanceof PropertyValidationError && err.fields.length > 0) {
      return {
        error: `Revisá estos campos: ${err.fields.map((f) => f.label).join(", ")}.`,
        fieldMessages: Object.fromEntries(err.fields.map((f) => [f.key, f.message])),
      };
    }
    return { error: "Revisá los campos: hay datos inválidos o faltantes." };
  }

  const supabase = await createClient();

  const fields = {
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
  };

  if (!id) {
    // Always create as draft, whatever the admin picked: photos are synced
    // in a second client-driven step (see PropertyForm), and a property
    // must never go live with zero/partial photos because that step hasn't
    // run yet. `intendedStatus` carries the real choice back to the client,
    // which promotes to `published` only once photos finish syncing.
    const { data: property, error } = await supabase
      .from("properties")
      .insert({ ...fields, status: "draft" })
      .select("id")
      .single();

    if (error || !property) {
      return {
        error: error?.message.includes("duplicate")
          ? "Ya existe una propiedad con ese slug."
          : "No se pudo crear la propiedad.",
      };
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
    return { propertyId: property.id, slug: parsed.slug, intendedStatus: parsed.status };
  }

  const { data: before } = await supabase
    .from("properties")
    .select("price, availability")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("properties").update(fields).eq("id", id);
  if (error) {
    return { error: "No se pudo actualizar la propiedad." };
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
  return { propertyId: id, slug: parsed.slug };
}

/** Bound directly to `<form action>` for the "new property" form — no
 * `.bind()` needed since there's no id to close over yet. */
export async function createPropertyAction(
  prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  return savePropertyBase(null, prevState, formData);
}

/** The edit form binds this with `.bind(null, property.id)`, same pattern
 * as the original pre-refactor `updateProperty`. */
export async function updatePropertyAction(
  id: string,
  prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  return savePropertyBase(id, prevState, formData);
}

/**
 * Writes the final `property_images` rows for a property from a list of
 * already-uploaded URLs (the browser uploads bytes straight to Storage
 * before calling this — see `PropertyImagesManager.commit`). `property_images`
 * is the source of truth for what's "live"; this never touches Storage.
 *
 * Deliberately not "atomic across DB + Storage": Postgres and Supabase
 * Storage are two different systems, so no snapshot-then-recheck dance
 * around a `Storage.remove()` here can fully close the gap between two
 * concurrent saves — it can only narrow it while still risking a valid,
 * freshly-re-added image getting deleted by a slower concurrent request.
 * Removing an object a moment too early is unrecoverable; leaving an
 * unreferenced object in Storage a while longer costs nothing but a few KB.
 * So this action only ever writes rows (via the row-locked, serialized
 * `sync_property_images` RPC — migration 0030) and never deletes Storage
 * objects. A photo the admin removes just stops being referenced/shown
 * immediately; its file may still exist in Storage until the separate,
 * manual `cleanupOrphanPropertyImages` maintenance action (see
 * property-images-cleanup.ts) reclaims it, well past a grace period, after
 * re-confirming it's still unreferenced at that later point in time.
 */
export async function syncPropertyImages(
  propertyId: string,
  images: { url: string; alt: string }[],
): Promise<{ error?: string }> {
  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para modificar fotos." };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("sync_property_images", {
    p_property_id: propertyId,
    p_images: images,
  });
  if (error) {
    return { error: "No se pudieron guardar las fotos." };
  }

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");
  return {};
}

/**
 * Second half of the safe-publish flow for a brand-new property: called
 * once photos have finished syncing, promoting the draft row created by
 * `savePropertyBase` to the admin's originally intended status. A no-op
 * for `draft` — the row is already there.
 */
export async function finalizePropertyPublish(
  id: string,
  status: "published" | "draft",
): Promise<{ error?: string }> {
  await requireStaff();
  if (status === "draft") return {};

  const supabase = await createClient();
  const { error } = await supabase.from("properties").update({ status }).eq("id", id);
  if (error) {
    return { error: "La propiedad se guardó como borrador, pero no se pudo publicar." };
  }

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");
  revalidatePath("/");
  return {};
}

export async function deleteProperty(id: string): Promise<{ error?: string }> {
  // Checked before any destructive call, not just hidden in the UI: RLS
  // alone let a non-admin agente's property_images delete succeed and only
  // reject the properties delete afterwards, leaving the listing half-gone
  // (photos wiped, property still published) with no error surfaced.
  await requireAdmin();

  const supabase = await createClient();

  // Delete the parent row first and stop on failure — property_images and
  // Storage cleanup only run once we know the property itself is gone, so a
  // blocked/failed delete never leaves the listing in a half-deleted state.
  const { error: propertyError } = await supabase.from("properties").delete().eq("id", id);
  if (propertyError) {
    return { error: "No se pudo eliminar la propiedad." };
  }

  // Belt-and-suspenders cleanup for anything the FK cascade didn't already
  // clear. Storage objects under this property's folder are deliberately
  // NOT touched here — Storage cleanup never runs synchronously as part of
  // a DB write (see syncPropertyImages above for why). They become
  // orphans, same as any image removed via the editor, and get reclaimed
  // later by cleanupOrphanPropertyImages once past its grace period.
  await supabase.from("property_images").delete().eq("property_id", id);

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");
  revalidatePath("/");
  return {};
}

export async function toggleFeatured(id: string, featured: boolean) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("properties").update({ featured }).eq("id", id);
  revalidatePath("/admin/propiedades");
  revalidatePath("/");
}

export async function updateAvailability(id: string, availability: string) {
  await requireStaff();
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
