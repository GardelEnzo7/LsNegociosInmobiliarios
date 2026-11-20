/**
 * Quick-action links for a contact's phone/email, shared by Consultas,
 * Contactos, Cobros and the contract detail.
 *
 * WhatsApp needs the full international number. Local Argentine numbers
 * are usually typed as "341 555-1234" or "0341 15 555-1234"; we strip the
 * trunk "0" and the mobile "15" and add "549". Numbers already starting
 * with 54 are left as typed. Anything too short to be a phone returns null.
 */
export function whatsappHref(phone: string | null | undefined, text?: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;

  if (!digits.startsWith("54")) {
    digits = digits.replace(/^0/, "");
    // "341 15 5551234" → area code (2-4 digits) + "15" + number.
    const mobile = digits.match(/^(\d{2,4})15(\d{6,8})$/);
    if (mobile && mobile[1].length + mobile[2].length === 10) digits = mobile[1] + mobile[2];
    digits = `549${digits}`;
  }

  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.length >= 6 ? `tel:${cleaned}` : null;
}

/** Contact field from the public form is "teléfono o email" free text. */
export function splitContact(contact: string): { phone: string | null; email: string | null } {
  return contact.includes("@") ? { phone: null, email: contact.trim() } : { phone: contact.trim(), email: null };
}
