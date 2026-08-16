begin;

-- Lets a freshly-authenticated user self-link their Supabase Auth account to
-- an admin_profiles row that an admin pre-created for them (matched by email,
-- only if that row isn't linked yet). Avoids needing service_role to
-- provision staff accounts: an admin creates the auth user manually from the
-- Supabase dashboard with the same email, and this runs on their first login.
create or replace function public.claim_admin_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  my_email text;
begin
  select email into my_email from auth.users where id = auth.uid();
  if my_email is null then
    return;
  end if;

  update public.admin_profiles
  set user_id = auth.uid()
  where lower(email) = lower(my_email) and user_id is null;
end;
$$;

revoke execute on function public.claim_admin_profile() from public;
grant execute on function public.claim_admin_profile() to authenticated;

commit;
