import { createClient } from "@/lib/supabase/server";
import { sortImages } from "@/lib/data/properties";
import { addDays, todayInArgentina } from "@/lib/rental-reminders";
import { formatNeighborhood } from "@/lib/utils";

export async function getAllProperties() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .order("created_at", { ascending: false });

  return (data ?? []).map(sortImages);
}

export async function getPropertyById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("id", id)
    .maybeSingle();

  return data ? sortImages(data) : null;
}

export async function getAdminProfileForCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_profiles")
    .select("id, full_name, role")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();
  return data;
}

export async function getActiveAdminProfiles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_profiles")
    .select("id, full_name")
    .eq("active", true)
    .order("full_name");

  return data ?? [];
}

export async function getActivityForEntity(entityType: "property", entityId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("id, event_type, description, created_at, actor:admin_profiles(full_name)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getPropertiesForSelect() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("id, title, neighborhood")
    .order("title");

  return data ?? [];
}

export async function getPropertyStats() {
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, neighborhood, views_count")
    .order("views_count", { ascending: false });

  return properties ?? [];
}

export async function getClosedDealsAnalytics() {
  const supabase = await createClient();
  const { data: deals } = await supabase
    .from("activity_log")
    .select("entity_id, created_at")
    .eq("event_type", "deal_closed")
    .order("created_at", { ascending: false });

  const { data: created } = await supabase
    .from("activity_log")
    .select("entity_id, created_at")
    .eq("event_type", "property_created");

  const createdMap = new Map((created ?? []).map((c) => [c.entity_id, c.created_at]));

  const rows = (deals ?? []).map((deal) => {
    const createdAt = createdMap.get(deal.entity_id);
    const days = createdAt
      ? Math.round((new Date(deal.created_at).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return { entityId: deal.entity_id, closedAt: deal.created_at, daysToClose: days };
  });

  const withDays = rows.filter((r) => r.daysToClose !== null) as { daysToClose: number }[];
  const avgDays =
    withDays.length > 0 ? Math.round(withDays.reduce((sum, r) => sum + r.daysToClose, 0) / withDays.length) : null;

  return { total: rows.length, avgDaysToClose: avgDays };
}

export async function getAdminProfiles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

const CONTRACT_SELECT =
  "*, properties(id, title, slug), owner:contacts!rental_contracts_owner_id_fkey(id, full_name, contact_phone, contact_email), tenant:contacts!rental_contracts_tenant_id_fkey(id, full_name, contact_phone, contact_email)";

export async function getAllContracts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_contracts")
    .select(CONTRACT_SELECT)
    .order("created_at", { ascending: false });

  return data ?? [];
}

/** Active contracts whose next rent adjustment is overdue or due within
 * `withinDays`, soonest first. Feeds the dashboard's "Próximos ajustes". */
export async function getUpcomingAdjustments(withinDays: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_contracts")
    .select(
      "id, adjustment_next_date, adjustment_type, rent_amount, rent_currency, properties(title), tenant:contacts!rental_contracts_tenant_id_fkey(full_name)",
    )
    .eq("status", "activo")
    .not("adjustment_next_date", "is", null)
    .lte("adjustment_next_date", addDays(todayInArgentina(), withinDays))
    .order("adjustment_next_date", { ascending: true });

  return data ?? [];
}

export async function getContractById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_contracts")
    .select(CONTRACT_SELECT)
    .eq("id", id)
    .maybeSingle();

  return data;
}

export async function getPropertyStatusCounts() {
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("status, availability, featured");
  const rows = data ?? [];

  return {
    total: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
    disponible: rows.filter((r) => r.availability === "disponible").length,
    reservada: rows.filter((r) => r.availability === "reservada").length,
    vendida: rows.filter((r) => r.availability === "vendida").length,
    alquilada: rows.filter((r) => r.availability === "alquilada").length,
    featured: rows.filter((r) => r.featured).length,
  };
}

export async function getContactsForSelect() {
  const supabase = await createClient();
  const { data } = await supabase.from("contacts").select("id, full_name").order("full_name");
  return data ?? [];
}

export async function getRecentActivity(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("id, entity_type, entity_id, event_type, description, created_at, actor:admin_profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getPropertyInternal(propertyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("property_internal")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle();

  return data;
}

export async function getPropertyDocuments(propertyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("property_documents")
    .select("*, uploaded_by_profile:admin_profiles(full_name)")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getPropertyListings(propertyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("property_listings")
    .select("*")
    .eq("property_id", propertyId);

  return data ?? [];
}

export async function getPropertiesNeedingAttention(limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "id, title, slug, status, created_at, updated_at, description, m2_total, price, property_images(id)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return rows
    .map((property) => {
      const reasons: string[] = [];
      if ((property.property_images?.length ?? 0) === 0) reasons.push("Sin fotografías");
      if (!property.description || property.description.trim().length < 40) {
        reasons.push("Descripción incompleta");
      }
      if (!property.m2_total) reasons.push("Sin superficie cargada");

      const createdMs = new Date(property.created_at).getTime();
      const updatedMs = new Date(property.updated_at).getTime();
      const neverTouched = Math.abs(updatedMs - createdMs) < 1000;
      if (neverTouched && now - createdMs > SIXTY_DAYS_MS) {
        reasons.push("Sin actividad hace más de 60 días");
      }

      return { ...property, reasons };
    })
    .filter((property) => property.reasons.length > 0)
    .slice(0, limit);
}

export async function getAdjustmentsForContract(contractId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_adjustments")
    .select("*")
    .eq("contract_id", contractId)
    .order("effective_date", { ascending: false });

  return data ?? [];
}

export async function getAgencyProfileAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("agency_profile").select("*").eq("id", 1).maybeSingle();
  return data;
}

export async function getPaymentsForContract(contractId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_payments")
    .select("*")
    .eq("contract_id", contractId)
    .order("period", { ascending: false });

  return data ?? [];
}

/** Active contracts ending within `withinDays` (or already past their end
 * date while still marked active), soonest first. */
export async function getExpiringContracts(withinDays: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_contracts")
    .select("id, end_date, rent_amount, rent_currency, properties(title), tenant:contacts!rental_contracts_tenant_id_fkey(full_name)")
    .eq("status", "activo")
    .not("end_date", "is", null)
    .lte("end_date", addDays(todayInArgentina(), withinDays))
    .order("end_date", { ascending: true });

  return data ?? [];
}

export type CollectionRow = {
  contractId: string;
  propertyTitle: string;
  tenantName: string | null;
  tenantPhone: string | null;
  rentAmount: number;
  rentCurrency: string;
  /** The "alquiler" payment registered for the period, if any. */
  rent: { id: string; amount: number | null; paid: boolean; paid_at: string | null } | null;
  /** Other charges (expensas, luz…) registered for the same period. */
  extras: { id: string; payment_type: string; amount: number | null; paid: boolean }[];
};

export type DebtRow = {
  id: string;
  contractId: string;
  propertyTitle: string;
  tenantName: string | null;
  payment_type: string;
  period: string;
  amount: number | null;
  currency: string;
};

/**
 * "Cobros" for one month: every active contract (already started by then)
 * with the state of its rent for `period` — paid, pending or not registered
 * yet — plus unpaid charges from earlier months as debt.
 */
export async function getCollections(period: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_contracts")
    .select(
      "id, rent_amount, rent_currency, start_date, properties(title), tenant:contacts!rental_contracts_tenant_id_fkey(full_name, contact_phone), rental_payments(id, payment_type, period, amount, paid, paid_at)",
    )
    .eq("status", "activo")
    .order("created_at", { ascending: true });

  const rows: CollectionRow[] = [];
  const debts: DebtRow[] = [];

  for (const contract of data ?? []) {
    const payments = contract.rental_payments ?? [];
    // Contracts starting after this month don't owe it yet.
    if (contract.start_date.slice(0, 7) <= period) {
      const inPeriod = payments.filter((p) => p.period === period);
      const rent = inPeriod.find((p) => p.payment_type === "alquiler") ?? null;
      rows.push({
        contractId: contract.id,
        propertyTitle: contract.properties?.title ?? "Propiedad eliminada",
        tenantName: contract.tenant?.full_name ?? null,
        tenantPhone: contract.tenant?.contact_phone ?? null,
        rentAmount: contract.rent_amount,
        rentCurrency: contract.rent_currency,
        rent: rent ? { id: rent.id, amount: rent.amount, paid: rent.paid, paid_at: rent.paid_at } : null,
        extras: inPeriod
          .filter((p) => p.payment_type !== "alquiler")
          .map((p) => ({ id: p.id, payment_type: p.payment_type, amount: p.amount, paid: p.paid })),
      });
    }
    for (const p of payments) {
      // Periods are YYYY-MM, so string comparison is chronological.
      if (!p.paid && p.period < period) {
        debts.push({
          id: p.id,
          contractId: contract.id,
          propertyTitle: contract.properties?.title ?? "Propiedad eliminada",
          tenantName: contract.tenant?.full_name ?? null,
          payment_type: p.payment_type,
          period: p.period,
          amount: p.amount,
          currency: p.payment_type === "alquiler" ? contract.rent_currency : "ARS",
        });
      }
    }
  }

  debts.sort((a, b) => a.period.localeCompare(b.period));
  return { rows, debts };
}

/** Contacts directory: each contact with its roles and the contracts it
 * appears in (as owner or tenant). */
export async function getContactsDirectory() {
  const supabase = await createClient();
  const [{ data: contacts }, { data: contracts }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, full_name, contact_phone, contact_email, notes, created_at, contact_roles(role)")
      .order("full_name"),
    supabase.from("rental_contracts").select("id, status, owner_id, tenant_id, properties(title)"),
  ]);

  return (contacts ?? []).map((contact) => {
    const related = (contracts ?? []).filter((c) => c.owner_id === contact.id || c.tenant_id === contact.id);
    return {
      id: contact.id,
      full_name: contact.full_name,
      contact_phone: contact.contact_phone,
      contact_email: contact.contact_email,
      notes: contact.notes,
      roles: Array.from(new Set((contact.contact_roles ?? []).map((r) => r.role))),
      contracts: related.map((c) => ({
        id: c.id,
        status: c.status,
        as: c.owner_id === contact.id ? ("propietario" as const) : ("inquilino" as const),
        propertyTitle: c.properties?.title ?? "Propiedad eliminada",
      })),
    };
  });
}

export type DirectoryContact = Awaited<ReturnType<typeof getContactsDirectory>>[number];

export async function getSiteMessages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_messages")
    .select("*, properties(title, slug)")
    .order("created_at", { ascending: false })
    .limit(300);

  // `available: false` = migration 0033 not applied yet.
  return { messages: data ?? [], available: !error };
}

export async function getNewMessagesCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("site_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "nueva");
  return error ? 0 : (count ?? 0);
}

function sumByCurrency(rows: { amount: number | null; currency: string }[]) {
  const byCurrency: Record<string, number> = {};
  for (const row of rows) byCurrency[row.currency] = (byCurrency[row.currency] ?? 0) + (row.amount ?? 0);
  return byCurrency;
}

/** Numbers for Estadísticas: administraciones, consultas and listings that
 * have been published a long time without closing. */
export async function getBusinessSummary(period: string) {
  const supabase = await createClient();
  const today = todayInArgentina();
  const since = addDays(today, -90);
  const [{ data: contracts }, { data: payments }, messages, { data: published }] = await Promise.all([
    supabase.from("rental_contracts").select("id, status, rent_amount, rent_currency"),
    supabase
      .from("rental_payments")
      .select("amount, paid, payment_type, rental_contracts(rent_currency)")
      .eq("period", period)
      .eq("payment_type", "alquiler"),
    supabase.from("site_messages").select("property_id, properties(title, neighborhood)").gte("created_at", since),
    supabase
      .from("properties")
      .select("id, title, neighborhood, created_at, views_count")
      .eq("status", "published")
      .in("availability", ["disponible", "reservada"])
      .order("created_at", { ascending: true }),
  ]);

  const active = (contracts ?? []).filter((c) => c.status === "activo");
  const rentPayments = (payments ?? []).map((p) => ({
    amount: p.amount,
    paid: p.paid,
    currency: p.rental_contracts?.rent_currency ?? "ARS",
  }));

  const perProperty = new Map<string, { title: string; neighborhood: string; count: number }>();
  let generalMessages = 0;
  for (const m of messages.data ?? []) {
    if (!m.property_id || !m.properties) {
      generalMessages += 1;
      continue;
    }
    const entry = perProperty.get(m.property_id) ?? {
      title: m.properties.title,
      neighborhood: formatNeighborhood(m.properties.neighborhood),
      count: 0,
    };
    entry.count += 1;
    perProperty.set(m.property_id, entry);
  }

  return {
    activeContracts: active.length,
    monthlyRent: sumByCurrency(active.map((c) => ({ amount: c.rent_amount, currency: c.rent_currency }))),
    collected: sumByCurrency(rentPayments.filter((p) => p.paid)),
    pending: sumByCurrency(rentPayments.filter((p) => !p.paid)),
    messagesAvailable: !messages.error,
    messagesTotal: (messages.data ?? []).length,
    generalMessages,
    messagesByProperty: Array.from(perProperty.values()).sort((a, b) => b.count - a.count),
    staleListings: (published ?? [])
      .map((p) => ({
        id: p.id,
        title: p.title,
        neighborhood: formatNeighborhood(p.neighborhood),
        views: p.views_count,
        days: Math.round((Date.parse(today) - Date.parse(p.created_at.slice(0, 10))) / 86_400_000),
      }))
      .filter((p) => p.days >= 90),
  };
}
