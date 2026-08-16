begin;

alter table public.admin_profiles
  add column user_id uuid references auth.users(id) unique;

update public.admin_profiles ap
set user_id = u.id
from auth.users u
where ap.email = u.email
  and ap.user_id is null;

create index if not exists admin_profiles_user_id_idx on public.admin_profiles(user_id);

commit;
