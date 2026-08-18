"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendContactNotificationEmail } from "@/lib/email";

const messageSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre.").max(100, "Nombre demasiado largo."),
  contact: z.string().trim().min(6, "Ingresá un teléfono o email válido.").max(100, "Dato de contacto demasiado largo."),
  message: z.string().trim().min(10, "Contanos un poco más en el mensaje.").max(2000, "Mensaje demasiado largo (máx. 2000 caracteres)."),
  propertyId: z.string().uuid().optional().or(z.literal("")),
  asunto: z.string().trim().max(120).optional(),
});

export type ContactFormState = {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<"name" | "contact" | "message", string>>;
};

const COOLDOWN_COOKIE = "ls_contact_cd";
const COOLDOWN_SECONDS = 30;

/** Per-browser cooldown via a short-lived cookie — no external store needed,
 * so it works unchanged on serverless without adding paid infra. Blocks
 * accidental double-submits and crude repeat-spam from the same client;
 * it isn't meant to stop a determined/cookie-less bot, just cheap abuse. */
async function isInCooldown(): Promise<boolean> {
  const store = await cookies();
  const last = Number(store.get(COOLDOWN_COOKIE)?.value);
  return Number.isFinite(last) && (Date.now() - last) / 1000 < COOLDOWN_SECONDS;
}

async function startCooldown() {
  const store = await cookies();
  store.set(COOLDOWN_COOKIE, String(Date.now()), {
    maxAge: COOLDOWN_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: a real visitor never fills this hidden field. Bots that
  // auto-fill every input do — return a fake success so they don't learn to
  // avoid the field, without ever sending the email.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "success" };
  }

  if (await isInCooldown()) {
    return { status: "error" };
  }

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

  await startCooldown();
  return { status: "success" };
}
