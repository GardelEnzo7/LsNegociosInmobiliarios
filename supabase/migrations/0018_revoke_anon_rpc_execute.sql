begin;

-- Auditoría de seguridad: Supabase otorga EXECUTE a anon/authenticated por
-- defecto en funciones nuevas del schema public. Ninguna de estas es
-- explotable hoy (todas devuelven null/no-op sin auth.uid()), pero
-- "permisos mínimos necesarios" exige revocar lo que anon no necesita.
-- increment_property_views se deja intacta: es pública a propósito (contador
-- de vistas del sitio público).

revoke execute on function public.current_admin_role() from anon;
revoke execute on function public.current_admin_profile_id() from anon;
revoke execute on function public.claim_admin_profile() from anon;

-- Funciones trigger: no están pensadas para invocarse como RPC directo
-- (requieren contexto de trigger). Se revoca el EXECUTE genérico que
-- Supabase concede por defecto; el trigger sigue funcionando porque
-- SECURITY DEFINER no depende del permiso EXECUTE del rol que dispara el evento.
revoke execute on function public.create_inquiry_from_message() from public, anon, authenticated;
revoke execute on function public.log_inquiry_created() from public, anon, authenticated;

commit;
