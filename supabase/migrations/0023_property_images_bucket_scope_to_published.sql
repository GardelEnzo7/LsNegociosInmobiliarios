begin;

-- Block K audit finding: the "public read property-images bucket" policy
-- (0021) grants SELECT on storage.objects to `anon` unconditionally, which
-- also governs the Storage `list()`/`get` API (not just the special public
-- URL route). That means anyone could call
-- `supabase.storage.from('property-images').list(propertyId)` for ANY
-- property id — including drafts and abandoned uploads — and enumerate
-- every filename inside, even though the *property_images table row* is
-- already hidden for non-published properties by migration 0004.
--
-- IMPORTANT — what this migration does NOT fix: `property-images` is a
-- PUBLIC bucket (by design, for fast/cacheable/SEO-friendly photos on
-- published listings — see README). Supabase serves public buckets at
-- `/storage/v1/object/public/{bucket}/{path}` WITHOUT evaluating any RLS
-- policy on storage.objects at all — that bypass is what "public bucket"
-- means. So once a specific object URL is known (e.g. captured from a
-- network request during upload), it stays fetchable regardless of this
-- policy change. Only making the bucket private and switching to signed
-- URLs (like property-documents) would close that residual gap, and that
-- would sacrifice the public/cacheable/SEO behavior the bucket is
-- deliberately public for — out of scope here, flagging for a manual
-- decision instead of silently changing the architecture.
--
-- What this migration DOES fix: it closes the enumeration/listing gap
-- (the `list()` API, and any direct authenticated-route reads), which is
-- the concrete, fixable part of the finding. Combined with property
-- creation now always starting as `draft` before photos are uploaded (see
-- the app-level publish-flow fix), the practical exposure window for
-- drafts is meaningfully narrower even though it isn't fully eliminated.

drop policy if exists "public read property-images bucket" on storage.objects;

create policy "public read images of published properties" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'property-images'
    and exists (
      select 1 from public.properties p
      where p.id::text = (storage.foldername(name))[1]
        and p.status = 'published'
    )
  );

-- Staff can always list/read regardless of status, so the admin panel keeps
-- working for drafts (editing photos before publishing, previewing, etc).
create policy "staff read property-images bucket" on storage.objects
  for select to authenticated
  using (bucket_id = 'property-images' and public.current_admin_role() is not null);

commit;
