begin;

create or replace function public.log_inquiry_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_log (entity_type, entity_id, event_type, actor, description)
  values ('inquiry', new.id, 'inquiry_created', null, 'Nueva consulta recibida desde el sitio web');
  return new;
end;
$$;

create trigger inquiries_log_creation
  after insert on public.inquiries
  for each row
  when (new.origin = 'web' and new.message_id is not null)
  execute procedure public.log_inquiry_created();

commit;
