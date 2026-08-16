begin;

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('property','contact','inquiry','visit')),
  entity_id uuid not null,
  event_type text not null check (event_type in (
    'property_created','property_updated','price_changed','availability_changed',
    'inquiry_created','inquiry_status_changed',
    'visit_created','visit_completed','visit_cancelled',
    'contact_created','deal_closed'
  )),
  actor uuid references public.admin_profiles(id),
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_entity_idx on public.activity_log(entity_type, entity_id, created_at desc);
create index activity_log_created_idx on public.activity_log(created_at desc);

alter table public.activity_log enable row level security;

create policy "staff can view activity_log" on public.activity_log for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can write activity_log" on public.activity_log for insert to authenticated with check (public.current_admin_role() is not null);
-- sin policy de update/delete: el historial no se edita ni se borra desde la app.

commit;
