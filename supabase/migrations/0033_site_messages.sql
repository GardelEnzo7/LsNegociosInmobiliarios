-- Bandeja de "Consultas" del sitio, de nuevo con registro en la base.
--
-- 0022 eliminó el pipeline anterior (messages + inquiries) y dejó el
-- formulario público enviando solo un email: si el email fallaba, la
-- consulta se perdía, y no había forma de medir consultas por propiedad.
-- Esta tabla es deliberadamente más simple que la anterior: un mensaje,
-- un estado (nueva / respondida / archivada) y nada más.
--
-- Seguridad: el público NO tiene ninguna policy sobre la tabla. La única
-- vía de escritura anónima es submit_site_message (SECURITY DEFINER), que
-- recorta/valida cada campo y siempre crea la fila en estado 'nueva'. Leer,
-- cambiar el estado y borrar queda solo para el staff (borrar: admins).

begin;

create table public.site_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  contact text not null check (char_length(contact) between 1 and 100),
  message text not null check (char_length(message) between 1 and 2000),
  subject text check (subject is null or char_length(subject) <= 200),
  property_id uuid references public.properties(id) on delete set null,
  status text not null default 'nueva' check (status in ('nueva', 'respondida', 'archivada'))
);

create index site_messages_created_idx on public.site_messages(created_at desc);
create index site_messages_status_idx on public.site_messages(status);
create index site_messages_property_idx on public.site_messages(property_id) where property_id is not null;

alter table public.site_messages enable row level security;

create policy "staff view site_messages" on public.site_messages
  for select to authenticated using (public.current_admin_role() is not null);
create policy "staff update site_messages" on public.site_messages
  for update to authenticated
  using (public.current_admin_role() is not null)
  with check (public.current_admin_role() is not null);
create policy "admins delete site_messages" on public.site_messages
  for delete to authenticated using (public.current_admin_role() = 'admin');

create or replace function public.submit_site_message(
  p_name text,
  p_contact text,
  p_message text,
  p_subject text,
  p_property_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_contact), '') = '' or coalesce(trim(p_message), '') = '' then
    raise exception 'Missing fields' using errcode = '22023';
  end if;

  insert into public.site_messages (name, contact, message, subject, property_id)
  values (
    left(trim(p_name), 100),
    left(trim(p_contact), 100),
    left(trim(p_message), 2000),
    nullif(left(trim(coalesce(p_subject, '')), 200), ''),
    -- Unknown ids become null instead of failing the whole submission.
    (select id from public.properties where id = p_property_id)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_site_message(text, text, text, text, uuid) from public;
grant execute on function public.submit_site_message(text, text, text, text, uuid) to anon, authenticated;

commit;
