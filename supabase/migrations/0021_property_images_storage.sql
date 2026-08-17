begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "public read property-images bucket" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'property-images');

create policy "staff can upload property-images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-images' and public.current_admin_role() is not null);

create policy "staff can update property-images" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-images' and public.current_admin_role() is not null)
  with check (bucket_id = 'property-images' and public.current_admin_role() is not null);

create policy "staff can delete property-images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-images' and public.current_admin_role() is not null);

commit;
