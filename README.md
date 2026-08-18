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
```

El dominio de producción (`https://inmobiliariasenmache.com.ar`) está hardcodeado como `SITE_URL` en `src/lib/constants.ts` — usado para `metadataBase`, canonical, `sitemap.xml`, `robots.txt` y Open Graph. A propósito no se lee de ninguna variable de entorno: este sitio tiene un único dominio de producción, y una env var (sobre todo en Netlify, que auto-popula variables con el subdominio `*.netlify.app`) es una fuente de errores, no de flexibilidad, para ese único valor.

`NEXT_PUBLIC_DEMO_MODE=true` es opcional y solo para demos/portfolio: muestra un aviso de "cuenta de prueba" en `/admin/login` sin ninguna credencial real embebida. Dejar sin definir en producción.

`RESEND_API_KEY` es obligatoria para que el formulario de contacto del sitio pueda enviar el email de notificación (vía la API de [Resend](https://resend.com), sin SDK — `fetch` directo). `RESEND_FROM_EMAIL` es opcional; sin dominio propio verificado en Resend, el remitente de pruebas (`onboarding@resend.dev`) solo puede enviar a la casilla con la que te registraste ahí.

`SUPABASE_DB_PASSWORD` **no** se usa en runtime — es exclusivamente para aplicar migraciones desde una máquina de desarrollo (ver abajo).

## Arquitectura

- **Sitio público** (`src/app/(site)/`): propiedades, Nosotros, Servicios, Contacto. Server Components, datos vía `src/lib/data/properties.ts`.
- **Panel admin** (`src/app/admin/`): protegido por middleware (`src/proxy.ts` + `src/lib/supabase/middleware.ts`) que exige sesión de Supabase Auth, y por RLS a nivel de base de datos (ver más abajo). Server Actions en `src/app/actions/*.ts`, lecturas en `src/lib/data/admin.ts`. Módulos: Propiedades, Administraciones (alquileres + ajustes), "Quién te acompaña" (contenido institucional de la home), Estadísticas, Usuarios. **No hay módulos de Clientes ni Visitas** — se evaluaron y se decidió no usarlos; el código y las rutas se eliminaron (ver más abajo).
- **`contacts`/`contact_roles`**: sigue existiendo como infraestructura mínima para propietario/inquilino de una `rental_contracts` (Administraciones) y para `property_internal.owner_contact_id`. No hay UI de CRM sobre estas tablas — se crean/editan solo indirectamente al cargar una administración o la info interna de una propiedad. `contact_properties` quedó sin uso (era exclusiva del CRM eliminado) y se eliminó junto con `visits` — ver migración `0026`.
- **`activity_log`** registra eventos de propiedades (alta/edición, cambio de precio, cambio de estado comercial, operación cerrada) para la pestaña "Actividad" de cada propiedad.
- **Consultas del sitio público**: el formulario de contacto (home, `/contacto` y cada propiedad) no guarda nada en la base — solo envía un email a `inmobiliariasenmache@gmail.com` vía Resend (`src/lib/email.ts`), con honeypot + cooldown de 30s por cookie contra spam básico. No hay bandeja de consultas dentro del panel admin; el seguimiento se hace por email. (Antes existían las tablas `inquiries`/`messages` con un pipeline propio en el panel — se eliminaron a pedido, ver migración `0022`.)
- **Tablas legacy congeladas** (no se usan para código nuevo, no se borran): `leads`, `owners`, `tenants`, `lead_properties` — reemplazadas por `contacts`/`contact_roles`. `rental_contracts`/`rental_payments` (módulo "Administraciones") siguen vigentes, ya re-apuntadas a `contacts`, y ahora incluyen ajuste de alquiler (tipo IPC/ICL/otro, periodicidad, próxima fecha calculada, historial en `rental_adjustments`).
- **Fotos de propiedades**: `property_images` + bucket de Storage público `property-images` (JPG/PNG/WEBP/AVIF, máx. 8MB por archivo, validado también a nivel de bucket). Se suben desde el formulario de propiedad en el panel admin (múltiples archivos, reordenables, con portada y alt text); las URLs son públicas y cacheables a propósito, para SEO e imágenes rápidas. Las propiedades cargadas antes de este cambio pueden seguir usando URLs externas (Unsplash, etc.) sin problema — ambos orígenes conviven. Una propiedad nueva se crea siempre como `draft` internamente y solo se promueve al estado elegido por el admin (`published`/`draft`) una vez que las fotos terminaron de subirse — evita que quede pública con cero fotos si la carga se corta a mitad de camino.
- **Documentos privados**: `property_documents` + bucket de Storage privado `property-documents` (nunca público). El acceso se resuelve con URLs firmadas temporales (60s), nunca con una URL pública permanente. La carga actual acepta PDF/JPG/PNG/WebP de hasta 900 KB, límite compatible con el máximo por defecto de Server Actions de Next.js.
- **Difusión** (`property_listings`): panel de seguimiento manual de en qué portales está publicada cada propiedad (Web LS, Zonaprop, Mercado Libre, otro). **No hay integraciones automáticas activas** — Zonaprop y Mercado Libre Inmuebles requieren cuenta partner + credenciales de su API oficial, que todavía no existen. Cuando estén disponibles, la tabla y la UI ya están preparadas para conectarlas.
- **"Quién te acompaña"** (home): contenido administrable desde `/admin/quien-te-acompana` — foto, nombre, matrícula, bio y frase institucional opcional de la fundadora (`agency_profile`, fila única). La foto vive en el bucket público `showcase-images`, separado de `property-images` y de `property-documents`. La tabla transitoria `showcase_cases` creada por `0024` se eliminó en `0027` antes de cargar contenido.

## Roles y seguridad

Dos roles en `admin_profiles.role`: `admin` (acceso total) y `agente` (todo el trabajo diario de propiedades/administraciones, sin poder gestionar usuarios ni borrar propiedades, contratos o documentos — eso es admin-only). La aplicación de roles vive en **RLS**, no solo en la UI: cualquier tabla administrativa exige `current_admin_role() IS NOT NULL` (o `= 'admin'` para lo destructivo), función `SECURITY DEFINER` que resuelve el rol vía `admin_profiles.user_id = auth.uid()`. Las Server Actions destructivas o sensibles (borrar propiedad, borrar documento, borrar contrato, etc.) también llaman `requireAdmin()`/`requireStaff()` explícitamente en el propio código de la acción, no solo se apoyan en RLS — así un rechazo por permisos nunca deja una operación a mitad de camino.

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
- Migraciones `0023`–`0027` (ver `supabase/migrations/`): **aplicadas** contra la base real. `0023` endurece políticas de Storage de `property-images`; `0024` creó `agency_profile`, el bucket `showcase-images` y una primera versión con `showcase_cases`; `0025` agregó ajustes de alquiler; `0026` eliminó `visits` y `contact_properties`; `0027` simplificó "Quién te acompaña", agregó los campos editoriales a `agency_profile` y eliminó `showcase_cases` (vacía al momento de aplicarla).
- Apple touch icon: sigue apuntando a `Logo-3.webp` en `metadata.icons.apple` (funciona en navegadores modernos, pero lo ideal es un PNG de 180×180 dedicado vía la convención `apple-icon.png` de Next.js). No se pudo generar en este entorno por una falla de la librería de conversión de imágenes disponible — pendiente de un asset o entorno con esa herramienta funcionando.
