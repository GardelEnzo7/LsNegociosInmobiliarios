-- APPLIED — verified read-only against the live database immediately
-- before running (visits: 0 rows, contact_properties: 0 rows, no FKs/
-- views/functions/triggers elsewhere depending on either table).
--
-- Block A/P: the Visitas and Clientes admin modules were removed from the
-- app in this pass (decision: neither is used). This migration drops the
-- two tables that were EXCLUSIVE to those modules and are now fully
-- unreferenced by application code:
--
--   * `visits` — was only read/written by the deleted Visitas pages and
--     Server Actions (src/app/actions/visits.ts, the /admin/visitas route,
--     VisitForm/VisitsList). Nothing else joins to it: `activity_log`
--     references entities by a plain (entity_type, entity_id) pair, not a
--     foreign key, so it has no FK dependency on `visits` to worry about.
--   * `contact_properties` — was only read/written by the deleted Clientes
--     CRM pages (getAllContacts/getContactById in src/lib/data/admin.ts,
--     ContactForm/ContactsList/ContactDetail, src/app/actions/contacts.ts).
--     Nothing else references it as a join target.
--
-- Verified NOT dropped here: `contacts` and `contact_roles` — still load-
-- bearing for Administraciones (owner/tenant on rental_contracts) and for
-- property_internal.owner_contact_id. Confirm this is still true against
-- the current codebase before running, in case that has changed since.
--
-- Before applying: re-run
--   grep -rn "\"visits\"\|\.from(\"visits\")\|contact_properties" src/
-- and confirm both come back empty (aside from src/lib/supabase/types.ts,
-- which is updated in the same commit as this migration once applied).

begin;

drop table if exists public.visits;
drop table if exists public.contact_properties;

commit;
