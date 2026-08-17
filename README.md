This is a [Next.js](https://nextjs.org) app for **LS Negocios Inmobiliarios** — sitio público + panel administrativo con CRM inmobiliario, sobre Supabase (Postgres + Auth + Storage).

## Getting Started

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para el sitio público y `/admin` para el panel.

Variables de entorno requeridas en `.env.local` (ver `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

`NEXT_PUBLIC_SITE_URL` es el dominio real de producción (sin barra final), usado para `metadataBase`, canonical, `sitemap.xml`, `robots.txt` y Open Graph. Sin esta variable cae a `http://localhost:3000` (solo válido en desarrollo) — **hay que configurarla en el hosting antes de salir a producción**.

`NEXT_PUBLIC_DEMO_MODE=true` es opcional y solo para demos/portfolio: muestra un aviso de "cuenta de prueba" en `/admin/login` sin ninguna credencial real embebida. Dejar sin definir en producción.

`RESEND_API_KEY` es obligatoria para que el formulario de contacto del sitio pueda enviar el email de notificación (vía la API de [Resend](https://resend.com), sin SDK — `fetch` directo). `RESEND_FROM_EMAIL` es opcional; sin dominio propio verificado en Resend, el remitente de pruebas (`onboarding@resend.dev`) solo puede enviar a la casilla con la que te registraste ahí.

`SUPABASE_DB_PASSWORD` **no** se usa en runtime — es exclusivamente para aplicar migraciones desde una máquina de desarrollo (ver abajo).

## Arquitectura

- **Sitio público** (`src/app/(site)/`): propiedades, Nosotros, Servicios, Contacto. Server Components, datos vía `src/lib/data/properties.ts`.
- **Panel admin** (`src/app/admin/`): protegido por middleware (`src/proxy.ts` + `src/lib/supabase/middleware.ts`) que exige sesión de Supabase Auth, y por RLS a nivel de base de datos (ver más abajo). Server Actions en `src/app/actions/*.ts`, lecturas en `src/lib/data/admin.ts`.
- **CRM**: `contacts` (con roles interesado/propietario/comprador/inquilino vía `contact_roles`) es el modelo unificado de personas. `visits` gestiona visitas a propiedades. `activity_log` registra eventos significativos (alta/edición de propiedad, cambio de precio, cambio de estado comercial, operación cerrada) para timelines en la ficha de propiedad y de cliente.
- **Consultas del sitio público**: el formulario de contacto (home, `/contacto` y cada propiedad) no guarda nada en la base — solo envía un email a `inmobiliariasenmache@gmail.com` vía Resend (`src/lib/email.ts`). No hay bandeja de consultas dentro del panel admin; el seguimiento se hace por email. (Antes existían las tablas `inquiries`/`messages` con un pipeline propio en el panel — se eliminaron a pedido, ver migración `0022`.)
- **Tablas legacy congeladas** (no se usan para código nuevo, no se borran): `leads`, `owners`, `tenants`, `lead_properties` — reemplazadas por `contacts`/`contact_roles`/`contact_properties`. `rental_contracts`/`rental_payments` (módulo "Administraciones") siguen vigentes, ya re-apuntadas a `contacts`.
- **Fotos de propiedades**: `property_images` + bucket de Storage público `property-images` (JPG/PNG/WEBP/AVIF, máx. 8MB por archivo, validado también a nivel de bucket). Se suben desde el formulario de propiedad en el panel admin (múltiples archivos, reordenables, con portada y alt text); las URLs son públicas y cacheables a propósito, para SEO e imágenes rápidas. Las propiedades cargadas antes de este cambio pueden seguir usando URLs externas (Unsplash, etc.) sin problema — ambos orígenes conviven.
- **Documentos privados**: `property_documents` + bucket de Storage privado `property-documents` (nunca público). El acceso se resuelve con URLs firmadas temporales (60s), nunca con una URL pública permanente.
- **Difusión** (`property_listings`): panel de seguimiento manual de en qué portales está publicada cada propiedad (Web LS, Zonaprop, Mercado Libre, otro). **No hay integraciones automáticas activas** — Zonaprop y Mercado Libre Inmuebles requieren cuenta partner + credenciales de su API oficial, que todavía no existen. Cuando estén disponibles, la tabla y la UI ya están preparadas para conectarlas.

## Roles y seguridad

Dos roles en `admin_profiles.role`: `admin` (acceso total) y `agente` (todo el trabajo diario de propiedades/clientes/visitas, sin poder gestionar usuarios ni borrar propiedades/clientes/contratos — eso es admin-only). La aplicación de roles vive en **RLS**, no solo en la UI: cualquier tabla administrativa exige `current_admin_role() IS NOT NULL` (o `= 'admin'` para lo destructivo), función `SECURITY DEFINER` que resuelve el rol vía `admin_profiles.user_id = auth.uid()`.

Para dar acceso real a un asesor nuevo: creá su cuenta en el Dashboard de Supabase (Authentication → Users → Add user) con el mismo email que le cargues en "Usuarios" del panel; su cuenta se vincula sola (`claim_admin_profile()`) la primera vez que inicia sesión. Crear usuarios directamente desde el panel (sin pasar por el Dashboard) requeriría `service_role`, que no está habilitado en este proyecto.

## Base de datos y migraciones

`supabase/migrations/` tiene el historial completo, aplicado en orden a la base real. No hay `supabase/config.toml` ni proyecto vinculado por CLI (Docker Desktop no está instalado en el entorno de desarrollo actual, que es lo que usan `supabase db pull/push`); las migraciones se aplican con una conexión directa a Postgres. Para aplicar una migración nueva:

1. Escribir el `.sql` en `supabase/migrations/`, envuelto en `begin; ... commit;`, sin operaciones destructivas sobre datos reales.
2. Aplicarla con un script Node + `pg` contra la connection string del pooler de Supabase (`SUPABASE_DB_PASSWORD` en `.env.local`, solo para esto).
3. Actualizar `src/lib/supabase/types.ts` a mano si la migración cambia el esquema (no hay `supabase gen types` disponible sin Docker).

## Limitaciones conocidas / pendiente

- Difusión a portales externos: sin integración real (ver arriba).
- Creación de usuarios 100% self-service desde el panel: pendiente de `service_role`.
- Sin baseline de migraciones generado por el CLI de Supabase (bloqueado por falta de Docker Desktop en este entorno); si se instala Docker, correr `supabase db pull` para reconciliar el historial del CLI con el estado real.
