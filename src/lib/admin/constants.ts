/**
 * Sistema de estados del panel — un estado no es lo mismo que un rol.
 * Los pipelines (disponibilidad, consulta, visita) usan la escala de tierra
 * de la marca (petróleo/bronce/terracota). Los roles de contacto son
 * categóricos, no cambian ni son buena/mala noticia, así que llevan un
 * tratamiento neutro de contorno, no color semántico. "Ganado" es petróleo
 * sólido, nunca verde — ver StatusPill en property-card.tsx.
 */

export type StatusTier = "neutral" | "info" | "pending" | "won" | "lost" | "role";

// Opacidades de texto elegidas para cumplir WCAG AA (>=4.5:1) sobre fondos
// claros — grafito puro (#2b333d) tiene contraste de sobra, pero las
// variantes atenuadas usadas para jerarquía silenciosa deben mantenerse por
// encima de ~72% de opacidad para no caer en zona de bajo contraste.
export const TIER_STYLES: Record<StatusTier, string> = {
  neutral: "text-grafito/75 ring-1 ring-inset ring-grafito/20",
  info: "bg-petroleo/[0.12] text-petroleo",
  pending: "bg-bronce/[0.14] text-bronce",
  won: "bg-petroleo text-blanco-roto",
  lost: "bg-terracota/[0.14] text-terracota",
  role: "text-grafito/75 ring-1 ring-inset ring-grafito/20",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reservada: "Reservada",
  vendida: "Vendida",
  alquilada: "Alquilada",
};

export const AVAILABILITY_TIERS: Record<string, StatusTier> = {
  disponible: "neutral",
  reservada: "pending",
  vendida: "won",
  alquilada: "won",
};

export const RENTAL_STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  finalizado: "Finalizado",
};

export const RENTAL_STATUS_TIERS: Record<string, StatusTier> = {
  activo: "info",
  finalizado: "neutral",
};

export const ADJUSTMENT_TYPE_LABELS: Record<string, string> = {
  ipc: "IPC",
  icl: "ICL",
  otro: "Otro",
};

/** The five standard periodicities the business asked for, expressed as
 * month counts — the column itself accepts any positive integer, this is
 * just what the UI offers. */
export const ADJUSTMENT_FREQUENCY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Mensual" },
  { value: 3, label: "Trimestral" },
  { value: 4, label: "Cuatrimestral" },
  { value: 6, label: "Semestral" },
  { value: 12, label: "Anual" },
];

export const LISTING_STATUS_LABELS: Record<string, string> = {
  publicada: "Publicada",
  no_publicada: "No publicada",
  pendiente: "Pendiente",
  error: "Error",
};

export const LISTING_STATUS_TIERS: Record<string, StatusTier> = {
  publicada: "won",
  no_publicada: "neutral",
  pendiente: "pending",
  error: "lost",
};

export const ACTIVITY_EVENT_LABELS: Record<string, string> = {
  property_created: "Propiedad creada",
  property_updated: "Propiedad modificada",
  price_changed: "Cambio de precio",
  availability_changed: "Cambio de estado comercial",
  deal_closed: "Operación cerrada",
  rent_adjusted: "Ajuste de alquiler aplicado",
};

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Recién";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `Hace ${diffHr} h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `Hace ${diffDay} d`;
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function isTomorrow(iso: string): boolean {
  const d = new Date(iso);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
}

export function isWithinDays(iso: string, days: number): boolean {
  const d = new Date(iso).getTime();
  const now = Date.now();
  return d >= now && d <= now + days * 24 * 60 * 60 * 1000;
}
