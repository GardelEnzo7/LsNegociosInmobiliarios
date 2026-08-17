import { createClient } from "@/lib/supabase/server";

export async function getAllProperties() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getPropertyById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("id", id)
    .maybeSingle();

  return data;
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

export async function getAllLeads() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*, lead_properties(properties(id, title, slug))")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllContacts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select(
      "*, contact_roles(role), contact_properties(properties(id, title, slug))",
    )
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getContactById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select(
      "*, contact_roles(role), contact_properties(properties(id, title, slug))",
    )
    .eq("id", id)
    .maybeSingle();

  return data;
}

export async function getVisitsForContact(contactId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("visits")
    .select(
      "id, scheduled_at, status, notes, property:properties(id, title, slug), assigned:admin_profiles(id, full_name)",
    )
    .eq("contact_id", contactId)
    .order("scheduled_at", { ascending: false });

  return data ?? [];
}

export async function getActivityForEntity(entityType: "property" | "contact" | "visit", entityId: string) {
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

export async function getAllVisits() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("visits")
    .select(
      "id, scheduled_at, status, notes, property:properties(id, title, slug), contact:contacts(id, full_name), assigned:admin_profiles(id, full_name)",
    )
    .order("scheduled_at", { ascending: true });

  return data ?? [];
}

export async function getContactsForSelect() {
  const supabase = await createClient();
  const { data } = await supabase.from("contacts").select("id, full_name").order("full_name");
  return data ?? [];
}

export async function getTodayVisits() {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const { data } = await supabase
    .from("visits")
    .select(
      "id, scheduled_at, status, property:properties(id, title, slug), contact:contacts(id, full_name), assigned:admin_profiles(id, full_name)",
    )
    .in("status", ["programada", "reprogramada"])
    .gte("scheduled_at", start.toISOString())
    .lte("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });

  return data ?? [];
}

export async function getUpcomingVisits(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("visits")
    .select(
      "id, scheduled_at, status, property:properties(id, title, slug), contact:contacts(id, full_name), assigned:admin_profiles(id, full_name)",
    )
    .eq("status", "programada")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(limit);

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

export async function getPaymentsForContract(contractId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_payments")
    .select("*")
    .eq("contract_id", contractId)
    .order("period", { ascending: false });

  return data ?? [];
}
