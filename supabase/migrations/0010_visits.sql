begin;

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id),
  contact_id uuid not null references public.contacts(id),
  assigned_to uuid references public.admin_profiles(id),
  scheduled_at timestamptz not null,
  status text not null default 'programada' check (status in ('programada','realizada','cancelada','reprogramada')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger visits_set_updated_at
  before update on public.visits
  for each row execute procedure moddatetime('updated_at');

create index visits_scheduled_idx on public.visits(scheduled_at);
create index visits_status_idx on public.visits(status);
create index visits_property_idx on public.visits(property_id);

alter table public.visits enable row level security;

create policy "staff manage visits" on public.visits for all to authenticated
  using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);

commit;
