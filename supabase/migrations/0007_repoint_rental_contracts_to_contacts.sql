begin;

do $$
begin
  if exists (select 1 from public.rental_contracts) then
    raise exception 'rental_contracts ya tiene filas: revisar manualmente antes de repuntar el FK';
  end if;
end $$;

alter table public.rental_contracts drop constraint rental_contracts_owner_id_fkey;
alter table public.rental_contracts drop constraint rental_contracts_tenant_id_fkey;

alter table public.rental_contracts
  add constraint rental_contracts_owner_id_fkey foreign key (owner_id) references public.contacts(id);
alter table public.rental_contracts
  add constraint rental_contracts_tenant_id_fkey foreign key (tenant_id) references public.contacts(id);

commit;
