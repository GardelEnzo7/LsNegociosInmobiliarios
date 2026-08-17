begin;

alter table public.properties
  add column year_built integer,
  add column has_garage boolean not null default false,
  add column expenses numeric,
  add column orientation text,
  add column credit_eligible boolean not null default false,
  add column professional_use boolean not null default false,
  add column meta_title text,
  add column meta_description text;

alter table public.properties
  add constraint properties_orientation_check
  check (orientation is null or orientation in ('norte','sur','este','oeste','noreste','noroeste','sureste','suroeste'));

alter table public.properties
  add constraint properties_year_built_check
  check (year_built is null or (year_built >= 1800 and year_built <= extract(year from now())::int + 1));

alter table public.properties
  add constraint properties_expenses_check
  check (expenses is null or expenses >= 0);

commit;
