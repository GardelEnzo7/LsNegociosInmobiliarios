import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ADJUSTMENT_TYPE_LABELS } from "@/lib/admin/constants";
import { sendRentalRemindersEmail, type RentalReminder } from "@/lib/email";
import {
  EXPIRY_REMINDER_DAYS_BEFORE,
  REMINDER_DAYS_BEFORE,
  addDays,
  describeDaysUntil,
  formatDateAR,
  todayInArgentina,
} from "@/lib/rental-reminders";
import { formatPrice } from "@/lib/utils";

/**
 * Daily job (see vercel.json → crons) that emails the agency inbox about:
 * - rent adjustments due exactly 15 days from today or today;
 * - contracts ending exactly 60 or 30 days from today.
 *
 * Only Vercel Cron can call it: Vercel sends `Authorization: Bearer
 * $CRON_SECRET`. Contracts are staff-only under RLS, so this server-only
 * route reads them with the Supabase secret key — never exposed to the
 * browser and used nowhere else.
 *
 * Exact-day matching (instead of "anything within N days") keeps each
 * contract to a couple of emails without storing "already notified" state.
 * The admin dashboard always lists everything due, so a missed run is only
 * a missed email.
 */
const SELECT =
  "id, adjustment_next_date, adjustment_type, end_date, rent_amount, rent_currency, properties(title), tenant:contacts!rental_contracts_tenant_id_fkey(full_name)";

/** Constant-time check of the Authorization header (hashing first makes the
 * buffers equal-length, as timingSafeEqual requires). */
function isAuthorized(header: string | null, secret: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header ?? ""), digest(`Bearer ${secret}`));
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !isAuthorized(request.headers.get("authorization"), cronSecret)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: "Falta SUPABASE_SECRET_KEY" }, { status: 500 });
  }

  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const today = todayInArgentina();
  const adjustmentDates = REMINDER_DAYS_BEFORE.map((days) => addDays(today, days));
  const expiryDates = EXPIRY_REMINDER_DAYS_BEFORE.map((days) => addDays(today, days));

  const [adjustmentsResult, expirationsResult] = await Promise.all([
    supabase
      .from("rental_contracts")
      .select(SELECT)
      .eq("status", "activo")
      .in("adjustment_next_date", adjustmentDates)
      .order("adjustment_next_date", { ascending: true }),
    supabase
      .from("rental_contracts")
      .select(SELECT)
      .eq("status", "activo")
      .in("end_date", expiryDates)
      .order("end_date", { ascending: true }),
  ]);

  if (adjustmentsResult.error || expirationsResult.error) {
    console.error("[cron/rental-reminders] query failed", adjustmentsResult.error ?? expirationsResult.error);
    return Response.json({ error: "No se pudieron leer los contratos" }, { status: 500 });
  }

  const daysFrom = (date: string, options: readonly number[]) => options.find((d) => addDays(today, d) === date) ?? 0;
  const rent = (c: { rent_amount: number; rent_currency: string }) =>
    `Alquiler actual: ${formatPrice(c.rent_amount, c.rent_currency as "USD" | "ARS")}`;

  const adjustments: RentalReminder[] = (adjustmentsResult.data ?? []).map((c) => ({
    contractId: c.id,
    propertyTitle: c.properties?.title ?? "Propiedad eliminada",
    tenantName: c.tenant?.full_name ?? null,
    date: formatDateAR(c.adjustment_next_date!),
    whenLabel: describeDaysUntil(daysFrom(c.adjustment_next_date!, REMINDER_DAYS_BEFORE)),
    detail: [rent(c), c.adjustment_type ? `Índice: ${ADJUSTMENT_TYPE_LABELS[c.adjustment_type] ?? c.adjustment_type}` : null]
      .filter(Boolean)
      .join(" · "),
  }));

  const expirations: RentalReminder[] = (expirationsResult.data ?? []).map((c) => ({
    contractId: c.id,
    propertyTitle: c.properties?.title ?? "Propiedad eliminada",
    tenantName: c.tenant?.full_name ?? null,
    date: formatDateAR(c.end_date!),
    whenLabel: describeDaysUntil(daysFrom(c.end_date!, EXPIRY_REMINDER_DAYS_BEFORE)),
    detail: rent(c),
  }));

  if (adjustments.length === 0 && expirations.length === 0) {
    return Response.json({ sent: 0, today });
  }

  try {
    await sendRentalRemindersEmail({ adjustments, expirations });
  } catch (sendError) {
    console.error("[cron/rental-reminders] email failed", sendError);
    return Response.json({ error: "No se pudo enviar el email" }, { status: 502 });
  }

  return Response.json({ sent: adjustments.length + expirations.length, today });
}
