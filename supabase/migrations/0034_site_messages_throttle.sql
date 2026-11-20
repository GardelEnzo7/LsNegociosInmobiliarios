-- Endurece submit_site_message (0033).
--
-- La función es invocable con la clave pública (anon), así que alguien puede
-- llamarla directo y saltear el honeypot y el cooldown del server action.
-- Sin infraestructura extra, se agregan dos frenos dentro de la función:
--   1. el mismo dato de contacto no puede enviar más de 3 mensajes en 10 min;
--   2. tope global de 30 mensajes cada 10 min (una inmobiliaria real recibe
--      muchísimo menos; si se alcanza es un ataque).
-- Si se rechaza, el server action igual manda el email (la consulta legítima
-- no se pierde), solo no se guarda en la bandeja.
--
-- Además, property_id solo se vincula a propiedades publicadas: un id de un
-- borrador no debe poder asociarse desde el público.

begin;

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
  v_contact text := left(trim(coalesce(p_contact, '')), 100);
begin
  if coalesce(trim(p_name), '') = '' or v_contact = '' or coalesce(trim(p_message), '') = '' then
    raise exception 'Missing fields' using errcode = '22023';
  end if;

  if (select count(*) from public.site_messages
      where created_at > now() - interval '10 minutes' and lower(contact) = lower(v_contact)) >= 3
     or (select count(*) from public.site_messages
         where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'Too many messages' using errcode = '54000';
  end if;

  insert into public.site_messages (name, contact, message, subject, property_id)
  values (
    left(trim(p_name), 100),
    v_contact,
    left(trim(p_message), 2000),
    nullif(left(trim(coalesce(p_subject, '')), 200), ''),
    (select id from public.properties where id = p_property_id and status = 'published')
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_site_message(text, text, text, text, uuid) from public;
grant execute on function public.submit_site_message(text, text, text, text, uuid) to anon, authenticated;

commit;
