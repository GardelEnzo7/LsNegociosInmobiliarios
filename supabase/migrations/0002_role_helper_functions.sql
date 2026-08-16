begin;

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.admin_profiles
  where user_id = auth.uid()
    and user_id is not null
    and active = true
  limit 1
$$;

create or replace function public.current_admin_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.admin_profiles
  where user_id = auth.uid()
    and user_id is not null
    and active = true
  limit 1
$$;

revoke execute on function public.current_admin_role() from public;
revoke execute on function public.current_admin_profile_id() from public;
grant execute on function public.current_admin_role() to authenticated;
grant execute on function public.current_admin_profile_id() to authenticated;

alter function public.increment_property_views(uuid) set search_path = public;

commit;
