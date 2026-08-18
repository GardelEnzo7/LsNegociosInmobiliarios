"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/supabase/guards";
import { deleteShowcaseImageByUrl } from "@/lib/admin/showcase-images";

const SHOWCASE_PUBLIC_PATH = "/storage/v1/object/public/showcase-images/";

const agencyProfileSchema = z.object({
  photoUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" && url.pathname.includes(SHOWCASE_PUBLIC_PATH);
      } catch {
        return false;
      }
    }, "La foto debe pertenecer al almacenamiento de la sección.")
    .optional(),
  photoAlt: z.string().trim().max(200).optional(),
  ownerName: z.string().trim().max(120).optional(),
  ownerLicense: z.string().trim().max(120).optional(),
  ownerBio: z.string().trim().max(600).optional(),
  ownerQuote: z.string().trim().max(300).optional(),
});

export type AgencyProfileFormState = { error?: string };

/** Single save for the whole "Quién te acompaña" profile — photo + name +
 * matrícula + bio + optional institutional quote. Replaced the old
 * showcase_cases CRUD entirely (product decision: no more case cards, see
 * migration 0027). */
export async function updateAgencyProfile(
  _prevState: AgencyProfileFormState,
  formData: FormData,
): Promise<AgencyProfileFormState> {
  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para editar esto." };
  }

  const parsed = agencyProfileSchema.safeParse({
    photoUrl: formData.get("photoUrl") || undefined,
    photoAlt: formData.get("photoAlt") || undefined,
    ownerName: formData.get("ownerName") || undefined,
    ownerLicense: formData.get("ownerLicense") || undefined,
    ownerBio: formData.get("ownerBio") || undefined,
    ownerQuote: formData.get("ownerQuote") || undefined,
  });

  if (!parsed.success) {
    return { error: "Revisá los campos." };
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("agency_profile")
    .select("owner_photo_url")
    .eq("id", 1)
    .maybeSingle();
  if (currentError || !current) {
    return { error: "No se encontró el perfil para actualizar." };
  }

  const nextPhotoUrl = parsed.data.photoUrl || null;

  const { data: updated, error } = await supabase
    .from("agency_profile")
    .update({
      owner_photo_url: nextPhotoUrl,
      owner_photo_alt: parsed.data.photoAlt || null,
      owner_name: parsed.data.ownerName || null,
      owner_license: parsed.data.ownerLicense || null,
      owner_bio: parsed.data.ownerBio || null,
      owner_quote: parsed.data.ownerQuote || null,
    })
    .eq("id", 1)
    .select("id")
    .single();

  if (error || !updated) {
    return { error: "No se pudo guardar." };
  }

  if (current?.owner_photo_url && current.owner_photo_url !== nextPhotoUrl) {
    await deleteShowcaseImageByUrl(supabase, current.owner_photo_url);
  }

  revalidatePath("/admin/quien-te-acompana");
  revalidatePath("/");
  return {};
}
