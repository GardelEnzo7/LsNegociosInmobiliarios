-- Codex audit follow-up (schema/RLS/storage half — RPCs are in 0029).
-- Does NOT modify 0023-0027, already applied. Pure additive/hardening DDL.
--
-- Verified read-only immediately before writing this migration:
--   * 3 properties (published), 27 property_images, 0 duplicate
--     (property_id, url) pairs — safe to add a unique constraint on that
--     pair (needed by 0029's sync_property_images upsert).
--   * rental_contracts / rental_adjustments: 0 rows each (re-confirmed
--     against production, not assumed) — safe to add NOT-NULL-shaped CHECK
--     constraints and a new column without any backfill.
--   * contact_roles already has `PRIMARY KEY (contact_id, role)` and a
--     CHECK on role values from the original schema — no change needed
--     there, only rental_adjustments needed new constraints.

begin;

-- 1) property_images: natural key for the upsert/diff sync RPC (0029) —
-- without this, "insert ... on conflict (property_id, url)" has nothing to
-- target. Confirmed no existing duplicates above.
alter table public.property_images
  add constraint property_images_property_id_url_key unique (property_id, url);

-- 2) rental_adjustments hardening.
alter table public.rental_adjustments
  -- Historical type at the moment of the adjustment — previously only
  -- rental_contracts.adjustment_type existed, so the log couldn't show what
  -- index was in effect for a past adjustment once the contract's current
  -- type changed later.
  add column adjustment_type text,
  add constraint rental_adjustments_adjustment_type_check
    check (adjustment_type is null or adjustment_type in ('ipc', 'icl', 'otro')),
  add constraint rental_adjustments_previous_amount_check check (previous_amount >= 0),
  add constraint rental_adjustments_new_amount_check check (new_amount > 0),
  add constraint rental_adjustments_percentage_check check (percentage is null or percentage > -100);

-- Composite index for the actual access pattern (a contract's adjustments
-- ordered by date) — replaces the single-column index, which is now a
-- redundant prefix of this one.
drop index if exists public.rental_adjustments_contract_idx;
create index rental_adjustments_contract_effective_idx
  on public.rental_adjustments(contract_id, effective_date);

-- Coherence between rental_contracts.adjustment_type and
-- adjustment_frequency_months — the app already enforces "both or neither"
-- via zod (superRefine in src/app/actions/rentals.ts); this makes it a
-- structural guarantee too, not just an application-layer convention.
alter table public.rental_contracts
  add constraint rental_contracts_adjustment_coherence_check
    check ((adjustment_type is null) = (adjustment_frequency_months is null));

-- Immutable history: SELECT stays available to staff, but there is no
-- INSERT/UPDATE/DELETE policy at all from here on — every write goes
-- through the `apply_rental_adjustment` SECURITY DEFINER RPC (0029), which
-- bypasses RLS by design (same pattern as current_admin_role() etc.) and is
-- the only place that keeps rental_adjustments and rental_contracts.rent_amount
-- in sync. A direct client insert/update/delete is no longer possible.
drop policy if exists "staff manage rental_adjustments" on public.rental_adjustments;
create policy "staff view rental_adjustments" on public.rental_adjustments
  for select to authenticated using (public.current_admin_role() is not null);

-- 3) property-documents bucket: was created with no file_size_limit / no
-- allowed_mime_types at all (storage.buckets columns were both null) — the
-- application already validates this in src/app/actions/property-documents.ts
-- (900KB, pdf/jpeg/png/webp), but that's defense purely in the app layer.
-- Mirrors the same limits at the bucket level so a direct Storage API call
-- can't bypass them. Bucket was already private (public: false) — no change
-- needed there.
update storage.buckets
set file_size_limit = 921600, -- 900 KiB, matches MAX_DOCUMENT_BYTES in the app
    allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
where id = 'property-documents';

-- 4) showcase-images bucket: SELECT was `to anon, authenticated using
-- (bucket_id = 'showcase-images')` — unconditional, so anon could call
-- `.storage.from('showcase-images').list()` and enumerate every object
-- (same class of finding as 0023 for property-images). The only real use
-- today is the founder's photo (owner_photo_url, folder "profile"), read
-- via its direct public URL — which is unaffected by this change, since a
-- public bucket's `/object/public/...` route is served without evaluating
-- any RLS policy at all (documented in 0023). This only closes the
-- `list()`/authenticated-route enumeration gap; it doesn't need scoping by
-- any table (there's no per-object ownership left to check against, unlike
-- property-images/properties, since showcase_cases was dropped in 0027).
drop policy if exists "public read showcase-images bucket" on storage.objects;
create policy "staff read showcase-images bucket" on storage.objects
  for select to authenticated
  using (bucket_id = 'showcase-images' and public.current_admin_role() is not null);

commit;
