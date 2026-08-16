begin;

do $$
declare
  t text;
  pol record;
begin
  foreach t in array array[
    'admin_profiles','leads','lead_properties','owners','tenants',
    'rental_contracts','rental_payments','properties','property_images','messages'
  ] loop
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
  end loop;
end $$;

-- admin_profiles: cualquier staff activo puede ver; solo admin gestiona perfiles
create policy "staff can view admin_profiles" on public.admin_profiles
  for select to authenticated using (public.current_admin_role() is not null);
create policy "admins can insert admin_profiles" on public.admin_profiles
  for insert to authenticated with check (public.current_admin_role() = 'admin');
create policy "admins can update admin_profiles" on public.admin_profiles
  for update to authenticated using (public.current_admin_role() = 'admin') with check (public.current_admin_role() = 'admin');
create policy "admins can delete admin_profiles" on public.admin_profiles
  for delete to authenticated using (public.current_admin_role() = 'admin');

-- leads / owners / tenants: entidades legacy congeladas, staff CRUD, delete solo admin
create policy "staff can view leads" on public.leads for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can write leads" on public.leads for insert to authenticated with check (public.current_admin_role() is not null);
create policy "staff can update leads" on public.leads for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "admins can delete leads" on public.leads for delete to authenticated using (public.current_admin_role() = 'admin');

create policy "staff can view owners" on public.owners for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can write owners" on public.owners for insert to authenticated with check (public.current_admin_role() is not null);
create policy "staff can update owners" on public.owners for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "admins can delete owners" on public.owners for delete to authenticated using (public.current_admin_role() = 'admin');

create policy "staff can view tenants" on public.tenants for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can write tenants" on public.tenants for insert to authenticated with check (public.current_admin_role() is not null);
create policy "staff can update tenants" on public.tenants for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "admins can delete tenants" on public.tenants for delete to authenticated using (public.current_admin_role() = 'admin');

-- tablas de detalle/join
create policy "staff manage lead_properties" on public.lead_properties for all to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "staff manage rental_payments" on public.rental_payments for all to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);

-- rental_contracts: entidad primaria, delete solo admin
create policy "staff can view rental_contracts" on public.rental_contracts for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can write rental_contracts" on public.rental_contracts for insert to authenticated with check (public.current_admin_role() is not null);
create policy "staff can update rental_contracts" on public.rental_contracts for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "admins can delete rental_contracts" on public.rental_contracts for delete to authenticated using (public.current_admin_role() = 'admin');

-- properties: mantiene lectura pública de publicadas + escritura de staff, delete solo admin
create policy "public read published properties" on public.properties
  for select to anon, authenticated using (status = 'published');
create policy "staff can view all properties" on public.properties
  for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can write properties" on public.properties
  for insert to authenticated with check (public.current_admin_role() is not null);
create policy "staff can update properties" on public.properties
  for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "admins can delete properties" on public.properties
  for delete to authenticated using (public.current_admin_role() = 'admin');

-- messages: mantiene insert público, lectura/gestión solo staff
create policy "public submit messages" on public.messages
  for insert to anon, authenticated with check (true);
create policy "staff can view messages" on public.messages
  for select to authenticated using (public.current_admin_role() is not null);
create policy "staff can update messages" on public.messages
  for update to authenticated using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);
create policy "staff can delete messages" on public.messages
  for delete to authenticated using (public.current_admin_role() is not null);

commit;
