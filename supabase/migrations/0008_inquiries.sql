begin;

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages(id),
  contact_id uuid references public.contacts(id),
  property_id uuid references public.properties(id),
  status text not null default 'nuevo' check (status in (
    'nuevo','contactado','en_seguimiento','visita_coordinada','negociacion','cerrado','perdido'
  )),
  origin text not null default 'web',
  assigned_to uuid references public.admin_profiles(id),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute procedure moddatetime('updated_at');

create index inquiries_status_idx on public.inquiries(status);
create index inquiries_property_idx on public.inquiries(property_id);
create index inquiries_contact_idx on public.inquiries(contact_id);
create index inquiries_assigned_idx on public.inquiries(assigned_to);

alter table public.inquiries enable row level security;

create policy "staff can view inquiries" on public.inquiries for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can write inquiries" on public.inquiries for insert to authenticated with check (public.current_admin_role() is not null);
create policy "staff can update inquiries" on public.inquiries for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "staff can delete inquiries" on public.inquiries for delete to authenticated using (public.current_admin_role() is not null);
-- sin ninguna policy para anon: ni siquiera INSERT. El único camino de escritura pública es el trigger de 0009.

commit;
