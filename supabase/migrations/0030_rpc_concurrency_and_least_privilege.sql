-- Codex second-pass audit follow-up. Does NOT modify 0023-0029, already
-- applied. Verified read-only immediately before writing this migration:
-- 3 published properties, 27 property_images, 0 duplicate (property_id,url)
-- pairs, 0 rental_contracts, 0 rental_adjustments — matches what the app
-- already assumed, re-confirmed rather than assumed.

begin;

-- ---------------------------------------------------------------------
-- 1A) sync_property_images: same signature, recreated to lock the
-- property row (`for update`) before touching property_images. Two calls
-- for the SAME property now serialize (the second blocks until the first
-- commits/rolls back); different properties lock different rows and still
-- run fully in parallel. Diff/upsert logic (not delete-all) is unchanged.
-- ---------------------------------------------------------------------
create or replace function public.sync_property_images(
  p_property_id uuid,
  p_images jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locked_id uuid;
begin
  if public.current_admin_role() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select id into v_locked_id from public.properties where id = p_property_id for update;
  if v_locked_id is null then
    raise exception 'Property not found' using errcode = 'P0002';
  end if;

  if jsonb_typeof(p_images) is distinct from 'array' then
    raise exception 'p_images must be a JSON array' using errcode = '22023';
  end if;

  delete from public.property_images
  where property_id = p_property_id
    and url not in (
      select value ->> 'url' from jsonb_array_elements(p_images)
    );

  insert into public.property_images (property_id, url, alt, position)
  select
    p_property_id,
    elem ->> 'url',
    coalesce(elem ->> 'alt', ''),
    ord - 1
  from jsonb_array_elements(p_images) with ordinality as t(elem, ord)
  on conflict (property_id, url)
  do update set alt = excluded.alt, position = excluded.position;
end;
$$;
-- Signature unchanged from 0029 — existing REVOKE/GRANT on this function
-- still apply, nothing to redo.

-- ---------------------------------------------------------------------
-- 2) create_rental_administration: drops the `p_adjustment_next_date`
-- parameter (a client-computed value a direct caller could set
-- incoherently) and computes it internally from `p_start_date` +
-- `p_adjustment_frequency_months` via add_months_clamped — the database is
-- now the only source of truth for that date, same as apply_rental_adjustment
-- already was. Parameter count changes, so the old 16-arg overload is
-- dropped first (CREATE OR REPLACE can't remove a parameter).
-- ---------------------------------------------------------------------
drop function if exists public.create_rental_administration(
  uuid, text, text, text, text, text, text, date, date, numeric, text, numeric, text, text, integer, date
);

create function public.create_rental_administration(
  p_property_id uuid,
  p_owner_name text,
  p_owner_phone text,
  p_owner_email text,
  p_tenant_name text,
  p_tenant_phone text,
  p_tenant_email text,
  p_start_date date,
  p_end_date date,
  p_rent_amount numeric,
  p_rent_currency text,
  p_expensas_amount numeric,
  p_notes text,
  p_adjustment_type text,
  p_adjustment_frequency_months integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_tenant_id uuid;
  v_contract_id uuid;
  v_next_date date;
begin
  if public.current_admin_role() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if not exists (select 1 from public.properties where id = p_property_id) then
    raise exception 'Property not found' using errcode = 'P0002';
  end if;

  if coalesce(trim(p_owner_name), '') = '' then
    raise exception 'Owner name is required' using errcode = '22023';
  end if;
  if coalesce(trim(p_tenant_name), '') = '' then
    raise exception 'Tenant name is required' using errcode = '22023';
  end if;

  if (p_adjustment_type is null) <> (p_adjustment_frequency_months is null) then
    raise exception 'adjustment_type and adjustment_frequency_months must both be set or both be null' using errcode = '22023';
  end if;
  if p_adjustment_type is not null and p_adjustment_type not in ('ipc', 'icl', 'otro') then
    raise exception 'Invalid adjustment_type' using errcode = '22023';
  end if;
  if p_adjustment_frequency_months is not null and p_adjustment_frequency_months <= 0 then
    raise exception 'Invalid adjustment_frequency_months' using errcode = '22023';
  end if;

  if p_adjustment_frequency_months is not null then
    v_next_date := public.add_months_clamped(p_start_date, p_adjustment_frequency_months);
  else
    v_next_date := null;
  end if;

  insert into public.contacts (full_name, contact_phone, contact_email, source)
  values (p_owner_name, p_owner_phone, p_owner_email, 'administracion')
  returning id into v_owner_id;

  insert into public.contact_roles (contact_id, role) values (v_owner_id, 'propietario');

  insert into public.contacts (full_name, contact_phone, contact_email, source)
  values (p_tenant_name, p_tenant_phone, p_tenant_email, 'administracion')
  returning id into v_tenant_id;

  insert into public.contact_roles (contact_id, role) values (v_tenant_id, 'inquilino');

  insert into public.rental_contracts (
    property_id, owner_id, tenant_id, start_date, end_date,
    rent_amount, rent_currency, expensas_amount, notes,
    adjustment_type, adjustment_frequency_months, adjustment_next_date
  ) values (
    p_property_id, v_owner_id, v_tenant_id, p_start_date, p_end_date,
    p_rent_amount, p_rent_currency, p_expensas_amount, p_notes,
    p_adjustment_type, p_adjustment_frequency_months, v_next_date
  )
  returning id into v_contract_id;

  return v_contract_id;
end;
$$;

revoke all on function public.create_rental_administration(
  uuid, text, text, text, text, text, text, date, date, numeric, text, numeric, text, text, integer
) from public;
grant execute on function public.create_rental_administration(
  uuid, text, text, text, text, text, text, date, date, numeric, text, numeric, text, text, integer
) to authenticated;

-- ---------------------------------------------------------------------
-- 3) update_rental_adjustment_settings: new RPC replacing the Server
-- Action's read-last-adjustment -> compute-in-TS -> update-without-lock
-- flow. Locks the SAME rental_contracts row (`for update`) that
-- apply_rental_adjustment locks, so the two now serialize against each
-- other on a given contract — whichever commits first wins, the other
-- sees its committed state before computing anything.
-- ---------------------------------------------------------------------
create or replace function public.update_rental_adjustment_settings(
  p_contract_id uuid,
  p_adjustment_type text,
  p_adjustment_frequency_months integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contract record;
  v_last_effective_date date;
  v_base_date date;
  v_next_date date;
begin
  if public.current_admin_role() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if (p_adjustment_type is null) <> (p_adjustment_frequency_months is null) then
    raise exception 'adjustment_type and adjustment_frequency_months must both be set or both be null' using errcode = '22023';
  end if;
  if p_adjustment_type is not null and p_adjustment_type not in ('ipc', 'icl', 'otro') then
    raise exception 'Invalid adjustment_type' using errcode = '22023';
  end if;
  if p_adjustment_frequency_months is not null and p_adjustment_frequency_months <= 0 then
    raise exception 'Invalid adjustment_frequency_months' using errcode = '22023';
  end if;

  select * into v_contract from public.rental_contracts where id = p_contract_id for update;
  if not found then
    raise exception 'Contract not found' using errcode = 'P0002';
  end if;

  select max(effective_date) into v_last_effective_date
  from public.rental_adjustments
  where contract_id = p_contract_id;

  v_base_date := coalesce(v_last_effective_date, v_contract.start_date);

  if p_adjustment_frequency_months is not null then
    v_next_date := public.add_months_clamped(v_base_date, p_adjustment_frequency_months);
  else
    v_next_date := null;
  end if;

  update public.rental_contracts
  set adjustment_type = p_adjustment_type,
      adjustment_frequency_months = p_adjustment_frequency_months,
      adjustment_next_date = v_next_date
  where id = p_contract_id;
end;
$$;

revoke all on function public.update_rental_adjustment_settings(uuid, text, integer) from public;
grant execute on function public.update_rental_adjustment_settings(uuid, text, integer) to authenticated;

-- ---------------------------------------------------------------------
-- 4/5) Least privilege pass. New Postgres functions get EXECUTE granted
-- to PUBLIC by default unless revoked — add_months_clamped never had that
-- revoked in 0029 (only the three SECURITY DEFINER RPCs did), so `anon`
-- could call it directly. It's a pure date-math helper with no data
-- access, but revoking it anyway follows least-privilege and closes the
-- Codex LOW finding. All three mutating RPCs above already only grant to
-- `authenticated` (never `anon`/`public`) and re-check
-- current_admin_role() internally regardless of who holds EXECUTE — no
-- change needed there, restated here for the audit trail:
--   sync_property_images, create_rental_administration,
--   apply_rental_adjustment, update_rental_adjustment_settings
--     -> EXECUTE revoked from public, granted only to authenticated;
--        staff check enforced inside every function body.
-- add_months_clamped is NOT granted to authenticated either: every caller
-- that needs it (the four functions above) is SECURITY DEFINER and owned
-- by the same role that owns add_months_clamped, so it can call it
-- internally without any EXECUTE grant — a role always has full
-- privileges, including EXECUTE, on functions it owns. No client should
-- ever call add_months_clamped directly.
revoke all on function public.add_months_clamped(date, integer) from public;

commit;
