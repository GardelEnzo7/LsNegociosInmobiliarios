"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const messageSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre."),
  contact: z.string().trim().min(6, "Ingresá un teléfono o email válido."),
  message: z.string().trim().min(10, "Contanos un poco más en el mensaje."),
  propertyId: z.string().uuid().optional().or(z.literal("")),
});

export type ContactFormState = {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<"name" | "contact" | "message", string>>;
};

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = messageSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    message: formData.get("message"),
    propertyId: formData.get("propertyId") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      errors: {
        name: fieldErrors.name?.[0],
        contact: fieldErrors.contact?.[0],
        message: fieldErrors.message?.[0],
      },
    };
  }

  const supabase = await createClient();
  const { name, contact, message, propertyId } = parsed.data;

  const { error } = await supabase.from("messages").insert({
    name,
    contact,
    message,
    property_id: propertyId ? propertyId : null,
  });

  if (error) {
    return { status: "error" };
  }

  return { status: "success" };
}

export async function markMessageRead(id: string, read: boolean) {
  const supabase = await createClient();
  await supabase.from("messages").update({ read }).eq("id", id);
  revalidatePath("/admin/mensajes");
}

export async function deleteMessage(id: string) {
  const supabase = await createClient();
  await supabase.from("messages").delete().eq("id", id);
  revalidatePath("/admin/mensajes");
}
