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

export async function getAllMessages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*, properties(title, slug)")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getUnreadMessageCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  return count ?? 0;
}

export async function getMessageById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("messages").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getAllLeads() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*, lead_properties(properties(id, title, slug))")
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
  const [{ data: properties }, { data: messages }] = await Promise.all([
    supabase
      .from("properties")
      .select("id, title, neighborhood, views_count")
      .order("views_count", { ascending: false }),
    supabase.from("messages").select("property_id"),
  ]);

  const messageCounts = new Map<string, number>();
  for (const message of messages ?? []) {
    if (!message.property_id) continue;
    messageCounts.set(message.property_id, (messageCounts.get(message.property_id) ?? 0) + 1);
  }

  return (properties ?? []).map((property) => ({
    ...property,
    messages_count: messageCounts.get(property.id) ?? 0,
  }));
}

export async function getAdminProfiles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllContracts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_contracts")
    .select(
      "*, properties(id, title, slug), owners(id, full_name, contact_phone, contact_email), tenants(id, full_name, contact_phone, contact_email)",
    )
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getContractById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_contracts")
    .select(
      "*, properties(id, title, slug), owners(id, full_name, contact_phone, contact_email), tenants(id, full_name, contact_phone, contact_email)",
    )
    .eq("id", id)
    .maybeSingle();

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
