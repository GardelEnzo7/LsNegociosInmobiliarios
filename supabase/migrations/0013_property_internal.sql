begin;

create table public.property_internal (
  property_id uuid primary key references public.properties(id) on delete cascade,
  owner_contact_id uuid references public.contacts(id),
  assigned_to uuid references public.admin_profiles(id),
  internal_notes text,
  commission numeric,
  keys_location text,
  visit_instructions text,
  initial_price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger property_internal_set_updated_at
  before update on public.property_internal
  for each row execute procedure moddatetime('updated_at');

alter table public.property_internal enable row level security;

create policy "staff manage property_internal" on public.property_internal for all to authenticated
  using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
-- sin ninguna policy para anon.

commit;
