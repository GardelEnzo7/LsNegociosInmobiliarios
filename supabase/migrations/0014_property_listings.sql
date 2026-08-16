begin;

create table public.property_listings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  channel text not null check (channel in ('web_ls','zonaprop','mercadolibre','otro')),
  status text not null default 'no_publicada' check (status in ('publicada','no_publicada','pendiente','error')),
  external_url text,
  last_synced_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (property_id, channel)
);

create index property_listings_property_idx on public.property_listings(property_id);

alter table public.property_listings enable row level security;

create policy "staff manage property_listings" on public.property_listings for all to authenticated
  using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);

commit;
