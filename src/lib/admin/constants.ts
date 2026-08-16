export const AVAILABILITY_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reservada: "Reservada",
  vendida: "Vendida",
  alquilada: "Alquilada",
};

export const AVAILABILITY_STYLES: Record<string, string> = {
  disponible: "bg-emerald-50 text-emerald-700",
  reservada: "bg-amber-50 text-amber-700",
  vendida: "bg-zinc-100 text-zinc-500",
  alquilada: "bg-zinc-100 text-zinc-500",
};

export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_seguimiento: "En seguimiento",
  visita_coordinada: "Visita coordinada",
  negociacion: "Negociación",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

export const INQUIRY_STATUS_STYLES: Record<string, string> = {
  nuevo: "bg-petroleo/10 text-petroleo",
  contactado: "bg-blue-50 text-blue-700",
  en_seguimiento: "bg-amber-50 text-amber-700",
  visita_coordinada: "bg-indigo-50 text-indigo-700",
  negociacion: "bg-orange-50 text-orange-700",
  cerrado: "bg-emerald-50 text-emerald-700",
  perdido: "bg-red-50 text-red-600",
};

export const INQUIRY_STATUS_ORDER = [
  "nuevo",
  "contactado",
  "en_seguimiento",
  "visita_coordinada",
  "negociacion",
  "cerrado",
  "perdido",
] as const;

export const VISIT_STATUS_LABELS: Record<string, string> = {
  programada: "Programada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
};

export const VISIT_STATUS_STYLES: Record<string, string> = {
  programada: "bg-petroleo/10 text-petroleo",
  realizada: "bg-emerald-50 text-emerald-700",
  cancelada: "bg-red-50 text-red-600",
  reprogramada: "bg-amber-50 text-amber-700",
};

export const VISIT_STATUS_ORDER = ["programada", "realizada", "cancelada", "reprogramada"] as const;

export const CONTACT_ROLE_LABELS: Record<string, string> = {
  interesado: "Interesado",
  propietario: "Propietario",
  comprador: "Comprador",
  inquilino: "Inquilino",
};

export const CONTACT_ROLE_STYLES: Record<string, string> = {
  interesado: "bg-petroleo/10 text-petroleo",
  propietario: "bg-indigo-50 text-indigo-700",
  comprador: "bg-emerald-50 text-emerald-700",
  inquilino: "bg-amber-50 text-amber-700",
};

export const ACTIVITY_EVENT_LABELS: Record<string, string> = {
  property_created: "Propiedad creada",
  property_updated: "Propiedad modificada",
  price_changed: "Cambio de precio",
  availability_changed: "Cambio de estado comercial",
  inquiry_created: "Nueva consulta",
  inquiry_status_changed: "Consulta actualizada",
  visit_created: "Visita programada",
  visit_completed: "Visita realizada",
  visit_cancelled: "Visita cancelada",
  contact_created: "Cliente creado",
  deal_closed: "Operación cerrada",
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
