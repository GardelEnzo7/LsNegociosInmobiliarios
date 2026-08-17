"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendContactNotificationEmail } from "@/lib/email";

const messageSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre."),
  contact: z.string().trim().min(6, "Ingresá un teléfono o email válido."),
  message: z.string().trim().min(10, "Contanos un poco más en el mensaje."),
  propertyId: z.string().uuid().optional().or(z.literal("")),
  asunto: z.string().trim().optional(),
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
    asunto: formData.get("asunto") ?? "",
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

  const { name, contact, message, propertyId, asunto } = parsed.data;

  let property: { title: string; slug: string } | null = null;
  if (propertyId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties")
      .select("title, slug")
      .eq("id", propertyId)
      .maybeSingle();
    property = data ?? null;
  }

  try {
    await sendContactNotificationEmail({ name, contact, message, asunto, property });
  } catch {
    return { status: "error" };
  }

  return { status: "success" };
}
