begin;

-- Auditoría de integridad: varias FKs quedaron con el default RESTRICT/NO
-- ACTION, lo que bloquearía operaciones normales (borrar un contacto, un
-- perfil de staff, o una cuenta de Auth) con un error de FK poco claro en
-- vez de simplemente desvincular el historial. Se aplica el mismo criterio
-- ya usado en 0016 para properties: el historial se conserva, solo se
-- desvincula la referencia.

alter table public.admin_profiles
  drop constraint admin_profiles_user_id_fkey,
  add constraint admin_profiles_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete set null;

alter table public.inquiries
  drop constraint inquiries_contact_id_fkey,
  add constraint inquiries_contact_id_fkey
    foreign key (contact_id) references public.contacts(id) on delete set null;

alter table public.inquiries
  drop constraint inquiries_assigned_to_fkey,
  add constraint inquiries_assigned_to_fkey
    foreign key (assigned_to) references public.admin_profiles(id) on delete set null;

alter table public.visits alter column contact_id drop not null;
alter table public.visits
  drop constraint visits_contact_id_fkey,
  add constraint visits_contact_id_fkey
    foreign key (contact_id) references public.contacts(id) on delete set null;

alter table public.visits
  drop constraint visits_assigned_to_fkey,
  add constraint visits_assigned_to_fkey
    foreign key (assigned_to) references public.admin_profiles(id) on delete set null;

alter table public.activity_log
  drop constraint activity_log_actor_fkey,
  add constraint activity_log_actor_fkey
    foreign key (actor) references public.admin_profiles(id) on delete set null;

alter table public.property_internal
  drop constraint property_internal_owner_contact_id_fkey,
  add constraint property_internal_owner_contact_id_fkey
    foreign key (owner_contact_id) references public.contacts(id) on delete set null;

alter table public.property_internal
  drop constraint property_internal_assigned_to_fkey,
  add constraint property_internal_assigned_to_fkey
    foreign key (assigned_to) references public.admin_profiles(id) on delete set null;

alter table public.property_documents alter column uploaded_by drop not null;
alter table public.property_documents
  drop constraint property_documents_uploaded_by_fkey,
  add constraint property_documents_uploaded_by_fkey
    foreign key (uploaded_by) references public.admin_profiles(id) on delete set null;

-- Índices de FK que faltaban y ya se usan en queries reales del panel
-- (borrado en cascada de mensaje->consulta, e historial de visitas por cliente).
create index if not exists inquiries_message_idx on public.inquiries(message_id);
create index if not exists visits_contact_idx on public.visits(contact_id);
create index if not exists visits_assigned_idx on public.visits(assigned_to);

commit;
