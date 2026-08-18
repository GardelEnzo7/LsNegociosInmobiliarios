begin;

-- Ambientes: independent from bedrooms/bathrooms, never derived from them.
alter table public.properties
  add column rooms integer;

alter table public.properties
  add constraint properties_rooms_check
  check (rooms is null or rooms > 0);

commit;
