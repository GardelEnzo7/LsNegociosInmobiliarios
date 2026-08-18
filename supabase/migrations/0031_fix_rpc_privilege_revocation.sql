-- Corrective follow-up to 0030, applied in the same session after
-- verifying 0030's actual effect against pg_proc.proacl.
--
-- 0030's `revoke all on function ... from public` did NOT remove `anon`'s
-- EXECUTE privilege. Supabase's default privileges grant EXECUTE on new
-- `public` schema functions directly to the `anon`, `authenticated`, and
-- `service_role` roles (not via the PUBLIC pseudo-role) — confirmed via
-- `select proacl from pg_proc where proname = 'add_months_clamped'`, which
-- showed explicit `anon=X/postgres` and `authenticated=X/postgres` entries
-- still present after 0030. `REVOKE ... FROM PUBLIC` only ever revokes the
-- separate PUBLIC-wide grant, so it was a no-op for these per-role grants.
-- This migration revokes the actual grants that matter.
--
-- Scope: `anon` (unauthenticated) loses EXECUTE on every mutating RPC and
-- on add_months_clamped — closes the Codex finding for real this time.
-- `authenticated` keeps EXECUTE on the four mutating RPCs (real staff call
-- them as `authenticated`; the internal current_admin_role() check is the
-- actual authorization gate), but loses it on add_months_clamped, which no
-- client should ever call directly — the four RPCs above call it
-- internally without needing their own EXECUTE grant, since all functions
-- here share the same owner (see 0030's comment). `service_role` is left
-- untouched: it's not used anywhere in this app (no service_role key is
-- issued to any client), so it isn't a client-reachable attack surface,
-- and revoking a role nothing here uses isn't this migration's job.

begin;

revoke execute on function public.add_months_clamped(date, integer) from anon;
revoke execute on function public.add_months_clamped(date, integer) from authenticated;

revoke execute on function public.sync_property_images(uuid, jsonb) from anon;

revoke execute on function public.create_rental_administration(
  uuid, text, text, text, text, text, text, date, date, numeric, text, numeric, text, text, integer
) from anon;

revoke execute on function public.apply_rental_adjustment(uuid, date, numeric, numeric, text) from anon;

revoke execute on function public.update_rental_adjustment_settings(uuid, text, integer) from anon;

commit;
