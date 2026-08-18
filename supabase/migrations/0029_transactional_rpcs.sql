-- Codex audit follow-up (RPC half — runs after 0028, which adds the
-- columns/constraints these functions rely on: rental_adjustments.adjustment_type,
-- property_images' (property_id, url) unique key).
--
-- Three SECURITY DEFINER functions replacing multi-step client-side flows
-- that could previously leave a partial write behind if a later step
-- failed. Each one IS the transaction: a single RPC call runs inside one
-- implicit Postgres transaction, and any unhandled exception aborts the
-- whole thing automatically — no explicit BEGIN/EXCEPTION juggling needed,
-- same as the existing current_admin_role()/claim_admin_profile() functions.
-- Authorization is checked inside every function (SECURITY DEFINER bypasses
-- RLS, so each one re-implements the same "staff only" gate RLS used to
-- provide).

begin;

-- ---------------------------------------------------------------------
-- sync_property_images: atomic replacement for the old
-- delete-then-insert Server Action logic (0026-era bug: an INSERT failure
-- after the DELETE left a property with zero photo rows). Diffs against
-- the final manifest instead of wiping everything, so images that persist
-- keep their `id` (and thus don't need to touch Storage at all — the
-- Server Action already never did).
-- ---------------------------------------------------------------------
create or replace function public.sync_property_images(
  p_property_id uuid,
  p_images jsonb -- [{ "url": text, "alt": text }, ...] in final display order
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_admin_role() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if not exists (select 1 from public.properties where id = p_property_id) then
    raise exception 'Property not found' using errcode = 'P0002';
  end if;

  if jsonb_typeof(p_images) is distinct from 'array' then
    raise exception 'p_images must be a JSON array' using errcode = '22023';
  end if;

  -- Remove rows for URLs no longer in the manifest (e.g. the admin removed
  -- a photo). Nothing here touches Storage — the Server Action still owns
  -- that step, unchanged, after this RPC returns successfully.
  delete from public.property_images
  where property_id = p_property_id
    and url not in (
      select value ->> 'url' from jsonb_array_elements(p_images)
    );

  -- Upsert the rest, preserving `id` for URLs that already existed and
  -- setting position from array order — this is the "diff" the audit asked
  -- for instead of an unconditional delete-all.
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

revoke all on function public.sync_property_images(uuid, jsonb) from public;
grant execute on function public.sync_property_images(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- create_rental_administration: atomic replacement for createContract's
-- four independent inserts (owner contact, owner role, tenant contact,
-- tenant role, contract). A failure on the contract insert used to leave
-- two orphaned contacts (and their roles) behind with no administration
-- referencing them.
-- ---------------------------------------------------------------------
create or replace function public.create_rental_administration(
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
  p_adjustment_frequency_months integer,
  p_adjustment_next_date date
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
    p_adjustment_type, p_adjustment_frequency_months, p_adjustment_next_date
  )
  returning id into v_contract_id;

  -- Any exception above (e.g. a rental_contracts CHECK violation) aborts
  -- this entire function's implicit transaction — the two contacts and
  -- their roles inserted earlier in this same call are rolled back too,
  -- so no orphaned contact can result from a failed contract insert.
  return v_contract_id;
end;
$$;

revoke all on function public.create_rental_administration(
  uuid, text, text, text, text, text, text, date, date, numeric, text, numeric, text, text, integer, date
) from public;
grant execute on function public.create_rental_administration(
  uuid, text, text, text, text, text, text, date, date, numeric, text, numeric, text, text, integer, date
) to authenticated;

-- ---------------------------------------------------------------------
-- add_months_clamped: SQL-side twin of the TS `addMonths` helper in
-- src/app/actions/rentals.ts (same "clamp to the target month's last valid
-- day" rule, e.g. Jan 31 + 1 month -> Feb 28/29, not an overflowed March
-- date like plain `date + interval` would give). Keeping both
-- implementations in lockstep is what "coherencia entre periodicidad y
-- próxima fecha" means in practice — every "next adjustment date" in the
-- app, whether computed client-side when just configuring the schedule or
-- server-side when actually applying an adjustment, agrees.
-- ---------------------------------------------------------------------
create or replace function public.add_months_clamped(p_date date, p_months integer)
returns date
language plpgsql
immutable
as $$
declare
  v_target_month_start date;
  v_target_month_end date;
  v_day int;
begin
  v_target_month_start := (date_trunc('month', p_date) + (p_months || ' months')::interval)::date;
  v_target_month_end := (v_target_month_start + interval '1 month - 1 day')::date;
  v_day := extract(day from p_date)::int;
  return least(v_target_month_start + (v_day - 1), v_target_month_end);
end;
$$;

-- ---------------------------------------------------------------------
-- apply_rental_adjustment: atomic replacement for registerAdjustment's
-- insert-then-update-with-manual-rollback-on-failure. Locks the contract
-- row (FOR UPDATE) so two concurrent adjustments on the same contract
-- can't both read the same "previous_amount" and race; validates the
-- effective date is strictly after the last adjustment (or the contract's
-- start date, if this is the first one); records the contract's
-- *current* adjustment_type onto the history row (0028); updates
-- rent_amount and recomputes adjustment_next_date; logs one activity_log
-- row. Any failure rolls back everything — the manual
-- `delete from rental_adjustments where id = ...` compensation in the old
-- Server Action is removed now that this is genuinely atomic.
-- ---------------------------------------------------------------------
create or replace function public.apply_rental_adjustment(
  p_contract_id uuid,
  p_effective_date date,
  p_percentage numeric,
  p_new_amount numeric,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contract record;
  v_last_effective_date date;
  v_adjustment_id uuid;
  v_next_date date;
  v_actor uuid;
begin
  if public.current_admin_role() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select * into v_contract
  from public.rental_contracts
  where id = p_contract_id
  for update; -- serializes concurrent adjustments on this same contract

  if not found then
    raise exception 'Contract not found' using errcode = 'P0002';
  end if;

  if p_new_amount is null or p_new_amount <= 0 then
    raise exception 'New amount must be greater than zero' using errcode = '22023';
  end if;

  select max(effective_date) into v_last_effective_date
  from public.rental_adjustments
  where contract_id = p_contract_id;

  if v_last_effective_date is null then
    if p_effective_date <= v_contract.start_date then
      raise exception 'Effective date must be after the contract start date' using errcode = '22023';
    end if;
  elsif p_effective_date <= v_last_effective_date then
    raise exception 'Effective date must be after the last adjustment' using errcode = '22023';
  end if;

  insert into public.rental_adjustments (
    contract_id, effective_date, previous_amount, percentage, new_amount, notes, adjustment_type
  ) values (
    p_contract_id, p_effective_date, v_contract.rent_amount, p_percentage, p_new_amount, p_notes,
    v_contract.adjustment_type
  )
  returning id into v_adjustment_id;

  if v_contract.adjustment_frequency_months is not null then
    v_next_date := public.add_months_clamped(p_effective_date, v_contract.adjustment_frequency_months);
  else
    v_next_date := null;
  end if;

  update public.rental_contracts
  set rent_amount = p_new_amount,
      adjustment_next_date = v_next_date
  where id = p_contract_id;

  v_actor := public.current_admin_profile_id();
  insert into public.activity_log (entity_type, entity_id, event_type, actor, description, metadata)
  values (
    'property',
    v_contract.property_id,
    'rent_adjusted',
    v_actor,
    format('Ajuste de alquiler aplicado: %s -> %s', v_contract.rent_amount, p_new_amount),
    jsonb_build_object('contractId', p_contract_id, 'from', v_contract.rent_amount, 'to', p_new_amount)
  );

  return v_adjustment_id;
end;
$$;

revoke all on function public.apply_rental_adjustment(uuid, date, numeric, numeric, text) from public;
grant execute on function public.apply_rental_adjustment(uuid, date, numeric, numeric, text) to authenticated;

commit;
