import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

type EntityType = "property" | "contact" | "visit";

type EventType =
  | "property_created"
  | "property_updated"
  | "price_changed"
  | "availability_changed"
  | "visit_created"
  | "visit_completed"
  | "visit_cancelled"
  | "contact_created"
  | "deal_closed";

export async function logActivity(
  params: {
    entityType: EntityType;
    entityId: string;
    eventType: EventType;
    description: string;
    metadata?: Json;
  },
  client?: SupabaseClient<Database>,
) {
  const supabase = client ?? (await createClient());
  const { data: profileId } = await supabase.rpc("current_admin_profile_id");

  await supabase.from("activity_log").insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    event_type: params.eventType,
    actor: profileId ?? null,
    description: params.description,
    metadata: params.metadata ?? null,
  });
}
