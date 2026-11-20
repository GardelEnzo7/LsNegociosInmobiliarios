/**
 * Rental adjustment reminders ("avisos de ajuste de alquiler").
 *
 * `rental_contracts.adjustment_next_date` is already maintained by the
 * apply_rental_adjustment RPC; this module only decides *when* to remind.
 * Dates are plain `YYYY-MM-DD` strings and "today" is always computed in
 * Argentina's timezone, so a server running in UTC never shifts a reminder
 * by a day around midnight.
 */

/** Days before the adjustment date on which the daily email is sent. */
export const REMINDER_DAYS_BEFORE = [15, 0] as const;

/** How far ahead the admin dashboard looks (overdue ones are always shown). */
export const DASHBOARD_WINDOW_DAYS = 15;

/** Contract end dates: emailed 60 and 30 days before (time to renew or
 * find a new tenant) and listed on the dashboard from 60 days out. */
export const EXPIRY_REMINDER_DAYS_BEFORE = [60, 30] as const;
export const EXPIRY_WINDOW_DAYS = 60;

const AR_TIMEZONE = "America/Argentina/Buenos_Aires";

/** Today's date in Argentina as `YYYY-MM-DD`. */
export function todayInArgentina(now = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: AR_TIMEZONE }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Whole days from `today` to `isoDate` (negative when already past). */
export function daysUntil(isoDate: string, today: string): number {
  const ms = Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function describeDaysUntil(days: number): string {
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days > 1) return `En ${days} días`;
  if (days === -1) return "Venció ayer";
  return `Venció hace ${Math.abs(days)} días`;
}

/** `2026-12-05` → `05/12/2026`. */
export function formatDateAR(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Payment periods are stored as `YYYY-MM`. */
export const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Current month in Argentina as `YYYY-MM`. */
export function currentPeriod(now = new Date()): string {
  return todayInArgentina(now).slice(0, 7);
}

export function shiftPeriod(period: string, months: number): string {
  const [y, m] = period.split("-").map(Number);
  const index = y * 12 + (m - 1) + months;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/** `2026-08` → `Agosto 2026`. Older free-text periods are shown as typed. */
export function formatPeriod(period: string): string {
  if (!PERIOD_PATTERN.test(period)) return period;
  const [y, m] = period.split("-");
  const month = MONTHS[Number(m) - 1];
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${y}`;
}
