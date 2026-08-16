"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresá un nombre."),
  email: z.string().trim().email("Ingresá un email válido."),
  role: z.enum(["admin", "agente"]),
});

export type ProfileFormState = { error?: string };

export async function createProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los campos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("admin_profiles").insert({
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    role: parsed.data.role,
  });

  if (error) {
    return { error: "No se pudo agregar el usuario." };
  }

  revalidatePath("/admin/usuarios");
  return {};
}

export async function toggleProfileActive(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("admin_profiles").update({ active }).eq("id", id);
  revalidatePath("/admin/usuarios");
}

export async function deleteProfile(id: string) {
  const supabase = await createClient();
  await supabase.from("admin_profiles").delete().eq("id", id);
  revalidatePath("/admin/usuarios");
}
