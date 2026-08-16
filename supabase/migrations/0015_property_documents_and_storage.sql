begin;

create table public.property_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  doc_type text not null check (doc_type in ('escritura','planos','contrato','autorizacion','impuestos','otro')),
  file_path text not null,
  uploaded_by uuid not null references public.admin_profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

create index property_documents_property_idx on public.property_documents(property_id);

alter table public.property_documents enable row level security;

create policy "staff manage property_documents" on public.property_documents for all to authenticated
  using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);

insert into storage.buckets (id, name, public)
values ('property-documents', 'property-documents', false)
on conflict (id) do nothing;

create policy "staff can read property documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'property-documents' and public.current_admin_role() is not null);

create policy "staff can upload property documents" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-documents' and public.current_admin_role() is not null);

create policy "staff can update property documents" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-documents' and public.current_admin_role() is not null)
  with check (bucket_id = 'property-documents' and public.current_admin_role() is not null);

create policy "admins can delete property documents" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-documents' and public.current_admin_role() = 'admin');

commit;
