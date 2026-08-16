begin;

drop policy if exists "public read property images" on public.property_images;
drop policy if exists "admin manage property images" on public.property_images;

create policy "public read images of published properties" on public.property_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and p.status = 'published'
    )
  );

create policy "staff manage property images" on public.property_images
  for all to authenticated
  using (public.current_admin_role() is not null)
  with check (public.current_admin_role() is not null);

commit;
