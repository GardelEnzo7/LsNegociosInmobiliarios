begin;

-- Block C: makes the "Quién te acompaña" home section (founder photo +
-- closed-case highlights) admin-manageable. Deliberately its own tables,
-- not `properties` — these are curated marketing entries (a case can exist
-- without a matching property, can have its own photo/copy independent of
-- the property record, and is manually ordered/hidden), which is a
-- different concern from the property inventory itself.

-- Singleton row for the founder photo. Enforced single-row via a fixed id
-- + check constraint (the standard Postgres "settings row" pattern) rather
-- than a key-value table, since there's exactly one fixed field today.
create table public.agency_profile (
  id smallint primary key default 1,
  owner_photo_url text,
  owner_photo_alt text,
  updated_at timestamptz not null default now(),
  constraint agency_profile_singleton check (id = 1)
);

insert into public.agency_profile (id) values (1);

create trigger agency_profile_set_updated_at
  before update on public.agency_profile
  for each row execute procedure moddatetime('updated_at');

create table public.showcase_cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  operation_type text not null,
  image_url text not null,
  image_alt text not null default '',
  property_id uuid references public.properties(id) on delete set null,
  position integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index showcase_cases_position_idx on public.showcase_cases(position);

create trigger showcase_cases_set_updated_at
  before update on public.showcase_cases
  for each row execute procedure moddatetime('updated_at');

alter table public.agency_profile enable row level security;
alter table public.showcase_cases enable row level security;

-- Public site reads the profile photo and visible cases directly (same
-- pattern as published properties) — no auth needed for the home page.
create policy "public read agency_profile" on public.agency_profile
  for select to anon, authenticated using (true);
create policy "public read visible showcase_cases" on public.showcase_cases
  for select to anon, authenticated using (visible = true);

-- Staff manage both; delete restricted to admin, mirroring the
-- destructive-action pattern used for properties/contracts/clientes.
create policy "staff view agency_profile" on public.agency_profile
  for select to authenticated using (public.current_admin_role() is not null);
create policy "staff update agency_profile" on public.agency_profile
  for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);

create policy "staff view all showcase_cases" on public.showcase_cases
  for select to authenticated using (public.current_admin_role() is not null);
create policy "staff write showcase_cases" on public.showcase_cases
  for insert to authenticated with check (public.current_admin_role() is not null);
create policy "staff update showcase_cases" on public.showcase_cases
  for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "admins delete showcase_cases" on public.showcase_cases
  for delete to authenticated using (public.current_admin_role() = 'admin');

-- Dedicated bucket, separate from property-images and the private
-- property-documents bucket — public/cacheable for the same SEO/perf
-- reasons as property photos, but its own folder namespace so cleanup and
-- policies stay independent of the property inventory.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'showcase-images',
  'showcase-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "public read showcase-images bucket" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'showcase-images');

create policy "staff can upload showcase-images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'showcase-images' and public.current_admin_role() is not null);

create policy "staff can update showcase-images" on storage.objects
  for update to authenticated
  using (bucket_id = 'showcase-images' and public.current_admin_role() is not null)
  with check (bucket_id = 'showcase-images' and public.current_admin_role() is not null);

create policy "staff can delete showcase-images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'showcase-images' and public.current_admin_role() is not null);

commit;
