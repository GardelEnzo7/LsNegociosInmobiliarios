begin;

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact_phone text,
  contact_email text,
  notes text,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute procedure moddatetime('updated_at');

create index contacts_email_idx on public.contacts (lower(contact_email)) where contact_email is not null;
create index contacts_phone_idx on public.contacts (contact_phone) where contact_phone is not null;

create table public.contact_roles (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  role text not null check (role in ('interesado','propietario','comprador','inquilino')),
  created_at timestamptz not null default now(),
  primary key (contact_id, role)
);

create table public.contact_properties (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (contact_id, property_id)
);
create index contact_properties_property_idx on public.contact_properties(property_id);

alter table public.contacts enable row level security;
alter table public.contact_roles enable row level security;
alter table public.contact_properties enable row level security;

create policy "staff can view contacts" on public.contacts for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can write contacts" on public.contacts for insert to authenticated with check (public.current_admin_role() is not null);
create policy "staff can update contacts" on public.contacts for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "admins can delete contacts" on public.contacts for delete to authenticated using (public.current_admin_role() = 'admin');

create policy "staff manage contact_roles" on public.contact_roles for all to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "staff manage contact_properties" on public.contact_properties for all to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);

commit;
