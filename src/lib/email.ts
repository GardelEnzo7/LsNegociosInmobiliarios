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

  await sendViaResend(apiKey, {
    subject,
    html,
    replyTo: isEmailContact ? params.contact : undefined,
    failureMessage: "No se pudo enviar el email de la consulta.",
  });
}

async function sendViaResend(
  apiKey: string,
  email: { subject: string; html: string; replyTo?: string; failureMessage: string },
): Promise<void> {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [SITE.email],
      subject: email.subject,
      html: email.html,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    throw new EmailSendError(email.failureMessage);
  }
}

export type RentalReminder = {
  contractId: string;
  propertyTitle: string;
  tenantName: string | null;
  date: string; // DD/MM/YYYY
  whenLabel: string; // "Hoy", "En 15 días"
  detail: string; // "Alquiler actual: $ 300.000 · Índice: ICL"
};

/** Daily digest sent by the rental-reminders cron to the agency inbox:
 * upcoming rent adjustments and contracts about to end. */
export async function sendRentalRemindersEmail({
  adjustments,
  expirations,
}: {
  adjustments: RentalReminder[];
  expirations: RentalReminder[];
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EmailSendError("El envío de email no está configurado (falta RESEND_API_KEY).");
  }

  const parts = [
    adjustments.length > 0
      ? `${adjustments.length} ${adjustments.length === 1 ? "ajuste de alquiler" : "ajustes de alquiler"}`
      : null,
    expirations.length > 0
      ? `${expirations.length} ${expirations.length === 1 ? "contrato por vencer" : "contratos por vencer"}`
      : null,
  ].filter(Boolean);
  const subject = `Avisos de administraciones: ${parts.join(" y ")}`;

  const table = (items: RentalReminder[]) =>
    `<table style="width: 100%; border-collapse: collapse;">${items
      .map(
        (r) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #dde1e5;">
          <strong>${escapeHtml(r.propertyTitle)}</strong><br>
          <span style="color: #5b636d;">${r.tenantName ? `Inquilino: ${escapeHtml(r.tenantName)} · ` : ""}${escapeHtml(r.detail)}</span><br>
          <a href="${SITE_URL}/admin/administraciones/${r.contractId}" style="color: #1f4147;">Abrir en el panel</a>
        </td>
        <td style="padding: 12px 0 12px 16px; border-bottom: 1px solid #dde1e5; text-align: right; white-space: nowrap; vertical-align: top;">
          <strong>${escapeHtml(r.whenLabel)}</strong><br>
          <span style="color: #5b636d;">${escapeHtml(r.date)}</span>
        </td>
      </tr>`,
      )
      .join("")}</table>`;

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #1c2129; max-width: 600px;">
      ${
        adjustments.length > 0
          ? `<h2 style="margin-bottom: 4px;">Ajustes de alquiler</h2>
      <p style="color: #5b636d; margin-top: 0;">Estos contratos tienen que actualizar el precio. Una vez calculado, registrá el ajuste en el panel para que se programe el siguiente.</p>
      ${table(adjustments)}`
          : ""
      }
      ${
        expirations.length > 0
          ? `<h2 style="margin: 28px 0 4px;">Contratos por vencer</h2>
      <p style="color: #5b636d; margin-top: 0;">Hora de hablar con propietario e inquilino sobre la renovación.</p>
      ${table(expirations)}`
          : ""
      }
    </div>
  `;

  await sendViaResend(apiKey, {
    subject,
    html,
    failureMessage: "No se pudo enviar el aviso de administraciones.",
  });
}
