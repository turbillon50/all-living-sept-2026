# ALL LIVING

**Stay · Enjoy · Belong.** El sistema operativo de la experiencia posterior a adquirir o utilizar una propiedad. V&LIVING hace posible que tengas el lugar; ALL LIVING hace posible que lo vivas.

PWA mobile-first en Next.js 16 (App Router, TypeScript strict), Tailwind v4, Clerk, Neon + Drizzle, Zod. Roles owner / guest / provider / operator / admin en una sola cuenta con contexto activo.

## Documentos
- `BUILD_PLAN.md` — fases, compuertas y decisiones (Drizzle, sin shadcn, roles fuera de Clerk).
- `PRODUCT_MAP.md` — las 55 pantallas y su ruta.
- `DATA_MODEL.md` — 28 tablas, invariantes en base de datos (una semana, una estancia; titularidad histórica).
- `INTEGRATIONS.md` — interfaces y adaptadores locales (pagos, canales, notificaciones, mensajería, acceso, mapas), eventos de dominio.

## Correr
```
pnpm install
cp .env.example .env.local     # DATABASE_URL (Neon), llaves de Clerk, ACCESS_TOKEN_SECRET
pnpm db:push                   # aplica el schema
pnpm db:seed                   # datos DEMO (is_demo=true): Luis García, Casa Mar · Tulum, F07, 3 semanas, 4 proveedores
pnpm dev
pnpm check                     # typecheck + lint + tests + build
pnpm test:e2e                  # Playwright 390 / 768 / 1440 (los flujos autenticados piden E2E_EMAIL y E2E_CODE)
```

## Estructura
```
src/app            rutas (App Router): (public) (onboarding) (app) api
src/domains        identity · fractions (FractionCoreClient) · properties · stays · services · bookings · providers · finance · operations · admin · home
src/core           env · roles · errores · eventos (outbox + auditoría) · formato
src/integrations   payments · channel-manager · notifications · messaging · access-control · maps
src/db             cliente Neon HTTP · schema Drizzle · seed
src/ui             anillo · tabbar/sidebar · botones · skeleton · estados
public/demo        fotografía demo local (WebP), public/sw.js service worker
e2e                Playwright
```

## Principios que el código respeta
- Nada estimado se mezcla con lo realizado: `income_entries.status` y la UI los separan.
- Nada se simula: sin llave, el adaptador local registra y lo dice (pagos DEMO, canal no publicado, cerradura no conectada).
- Nunca doble reserva: índices únicos parciales en `stays` y `rental_inventory`; `claimWeek` es atómico con compensación.
- La titularidad no se sobrescribe: filas cerradas con `transferred_at`, una activa por fracción.
- El QR del Living Pass no lleva datos: token firmado (jose) con expiración, solo el hash en base.
- Admin y operator nunca se autoasignan: `ADMIN_EMAILS` al primer acceso o desde `/admin/users` por otro admin.

## Estado
Fases 0 a 7 implementadas; fase 8 (PWA, e2e, hardening) en curso. Falta la app real de Clerk (llaves) para login y capturas de las pantallas autenticadas.
