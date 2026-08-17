begin;

-- Se elimina el pipeline de "Consultas" (mensajes del sitio + inquiries):
-- de ahora en más el formulario público solo envía un email, sin dejar
-- registro en la base. IRREVERSIBLE: borra cualquier mensaje/consulta real
-- que ya exista en estas tablas — hacer un backup antes de aplicar si se
-- quiere conservar ese historial.

drop trigger if exists messages_create_inquiry on public.messages;
drop function if exists public.create_inquiry_from_message();

drop table if exists public.inquiries;
drop table if exists public.messages;

commit;
