-- APPLIED — product decision reversal: the "operaciones cerradas" showcase
-- cards were cut before any content was ever loaded into them. Verified
-- read-only immediately before writing/running this migration:
-- `select count(*) from public.showcase_cases` = 0 rows.
--
-- Does NOT touch migration 0024 (already applied, left as-is). This is a
-- pure follow-up cleanup migration.
--
-- What this does:
--   1. Adds the profile fields the simplified admin form needs
--      (owner_name, owner_license, owner_bio, owner_quote) to the existing
--      `agency_profile` singleton — additive, non-destructive. Backfills
--      the one existing row with the real values already used elsewhere in
--      the app (SITE.displayName / SITE.matricula in src/lib/constants.ts,
--      and the description text previously hardcoded in
--      owner-showcase.tsx), so the admin form isn't blank on first load.
--      `owner_quote` (frase institucional) is left null — optional, no
--      existing copy to backfill it with, not invented here.
--   2. Drops `public.showcase_cases` (confirmed empty above). Its indexes,
--      triggers and RLS policies are dropped automatically with the table
--      — nothing else references it (re-verified with the same dependency
--      queries used before the 0026 review: no FKs, views, functions, or
--      triggers elsewhere depend on it).
--
-- What this deliberately does NOT do:
--   - Does not touch `public.properties` or `public.property_images`.
--   - Does not touch `public.rental_contracts` or `public.rental_adjustments`.
--   - Does not touch the `property-images` or `property-documents` buckets.
--   - Does not drop or rename the `showcase-images` bucket or its storage
--     policies: it's still the upload target for Laura's photo
--     (`owner_photo_url`, folder "profile"), just no longer also used for
--     case images (folder "cases", never populated). Its existing policies
--     are bucket-wide (staff upload/update/delete, public read), not
--     coupled to the `showcase_cases` table in any way, so there is
--     nothing to simplify there.

begin;

alter table public.agency_profile
  add column owner_name text,
  add column owner_license text,
  add column owner_bio text,
  add column owner_quote text;

update public.agency_profile
set
  owner_name = 'Laura Senmache',
  owner_license = 'Mat. Nro: 2589 COCIR',
  owner_bio = 'Más de 5 años acompañando a familias rosarinas a comprar, vender y alquilar con confianza.'
where id = 1;

drop table if exists public.showcase_cases;

commit;
