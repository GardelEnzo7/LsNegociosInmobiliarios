begin;

insert into public.contacts (id, full_name, contact_phone, contact_email, notes, source, created_at)
select id, name, contact_phone, contact_email, notes, 'leads_migration', created_at
from public.leads
on conflict (id) do nothing;

insert into public.contact_roles (contact_id, role)
select id, 'interesado' from public.leads
on conflict do nothing;

insert into public.contacts (id, full_name, contact_phone, contact_email, notes, source, created_at)
select id, full_name, contact_phone, contact_email, notes, 'owners_migration', created_at
from public.owners
on conflict (id) do nothing;

insert into public.contact_roles (contact_id, role)
select id, 'propietario' from public.owners
on conflict do nothing;

insert into public.contacts (id, full_name, contact_phone, contact_email, notes, source, created_at)
select id, full_name, contact_phone, contact_email, notes, 'tenants_migration', created_at
from public.tenants
on conflict (id) do nothing;

insert into public.contact_roles (contact_id, role)
select id, 'inquilino' from public.tenants
on conflict do nothing;

insert into public.contact_properties (contact_id, property_id, created_at)
select lead_id, property_id, created_at from public.lead_properties
on conflict do nothing;

commit;
