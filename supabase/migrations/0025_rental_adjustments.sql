begin;

-- Block H: rental adjustment (ajuste de alquiler) tracking for
-- Administraciones. No billing/invoicing and no external index API — the
-- app models the schedule and lets staff register each adjustment's
-- percentage/value manually. `rent_amount` on rental_contracts remains the
-- single source of truth for "current value", so it is not duplicated here.

alter table public.rental_contracts
  add column adjustment_type text check (adjustment_type in ('ipc', 'icl', 'otro')),
  -- Periodicity as a month count rather than a fixed enum of the 5 named
  -- options (mensual=1, trimestral=3, cuatrimestral=4, semestral=6,
  -- anual=12): the UI offers exactly those five, but the column itself
  -- isn't hardcoded to them, so a non-standard cadence needs no schema
  -- change later.
  add column adjustment_frequency_months integer check (adjustment_frequency_months > 0),
  add column adjustment_next_date date;

create index rental_contracts_adjustment_next_date_idx
  on public.rental_contracts(adjustment_next_date)
  where adjustment_next_date is not null;

-- History of adjustments actually applied — same shape/role as
-- rental_payments (a child log table per contract), not new columns bolted
-- onto rental_contracts, since a contract can go through many adjustments
-- over its lifetime.
create table public.rental_adjustments (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.rental_contracts(id) on delete cascade,
  effective_date date not null,
  previous_amount numeric not null,
  percentage numeric,
  new_amount numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

create index rental_adjustments_contract_idx on public.rental_adjustments(contract_id);

alter table public.rental_adjustments enable row level security;

create policy "staff manage rental_adjustments" on public.rental_adjustments for all to authenticated
  using (public.current_admin_role() is not null) with check (public.current_admin_role() is not null);

commit;
