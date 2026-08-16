begin;

insert into public.inquiries (message_id, property_id, status, origin, created_at)
select m.id, m.property_id, case when m.read then 'contactado' else 'nuevo' end, 'web', m.created_at
from public.messages m
where not exists (select 1 from public.inquiries i where i.message_id = m.id);

create or replace function public.create_inquiry_from_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.inquiries (message_id, property_id, status, origin)
  values (new.id, new.property_id, 'nuevo', 'web');
  return new;
end;
$$;

create trigger messages_create_inquiry
  after insert on public.messages
  for each row execute procedure public.create_inquiry_from_message();

commit;
