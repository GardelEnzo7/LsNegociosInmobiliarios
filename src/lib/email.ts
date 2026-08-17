import { SITE, SITE_URL } from "@/lib/constants";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "LS Negocios Inmobiliarios <onboarding@resend.dev>";

export class EmailSendError extends Error {}

/** Minimal HTML-escaping for text interpolated into the email body — the
 * message/name/contact fields come straight from an anonymous public form. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactNotificationEmail(params: {
  name: string;
  contact: string;
  message: string;
  asunto?: string;
  property?: { title: string; slug: string } | null;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EmailSendError("El envío de email no está configurado (falta RESEND_API_KEY).");
  }

  const isEmailContact = params.contact.includes("@");
  const subject = params.asunto
    ? `Nueva consulta — ${params.asunto}`
    : `Nueva consulta de ${params.name}`;

  const propertyLine = params.property
    ? `<p><strong>Propiedad:</strong> ${escapeHtml(params.property.title)}<br>
       <a href="${SITE_URL}/propiedades/${params.property.slug}">${SITE_URL}/propiedades/${params.property.slug}</a></p>`
    : "";

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #1c2129;">
      <h2 style="margin-bottom: 4px;">Nueva consulta desde el sitio</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(params.name)}</p>
      <p><strong>Contacto:</strong> ${escapeHtml(params.contact)}</p>
      ${propertyLine}
      <p><strong>Mensaje:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(params.message)}</p>
    </div>
  `;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [SITE.email],
      subject,
      html,
      ...(isEmailContact ? { reply_to: params.contact } : {}),
    }),
  });

  if (!response.ok) {
    throw new EmailSendError("No se pudo enviar el email de la consulta.");
  }
}
