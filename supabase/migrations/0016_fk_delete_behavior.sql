begin;

-- Deleting a message should remove its derived inquiry (the inquiry has no
-- meaning without the inbound record that created it).
alter table public.inquiries
  drop constraint inquiries_message_id_fkey,
  add constraint inquiries_message_id_fkey
    foreign key (message_id) references public.messages(id) on delete cascade;

-- Deleting a property should not be blocked by CRM history that references
-- it (inquiries/visits/messages) — keep the record, just drop the link.
alter table public.inquiries
  drop constraint inquiries_property_id_fkey,
  add constraint inquiries_property_id_fkey
    foreign key (property_id) references public.properties(id) on delete set null;

-- visits.property_id was NOT NULL; relax it so history survives a property
-- deletion instead of blocking it or silently deleting the visit record.
alter table public.visits alter column property_id drop not null;
alter table public.visits
  drop constraint visits_property_id_fkey,
  add constraint visits_property_id_fkey
    foreign key (property_id) references public.properties(id) on delete set null;

alter table public.messages
  drop constraint messages_property_id_fkey,
  add constraint messages_property_id_fkey
    foreign key (property_id) references public.properties(id) on delete set null;

commit;
