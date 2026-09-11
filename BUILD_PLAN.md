# BUILD_PLAN — ALL LIVING

Fuente: MASTER BUILD SPEC v1 (Luis, 09-sep-2026). Este plan no la reinterpreta: la ordena en fases ejecutables con su compuerta.

## Estado del repo al arrancar
Vacío (un README de una línea). No hay arquitectura previa que documentar.

## Decisiones fijadas
| Tema | Decisión | Por qué |
|---|---|---|
| Framework | Next.js 16.3 App Router, React 19, TypeScript strict | Spec §33. Route Handlers para API, Server Actions para mutaciones de UI |
| ORM | **Drizzle** sobre `@neondatabase/serverless` (HTTP) | Sin pool TCP (Vercel serverless), migraciones SQL legibles en `drizzle/`, tipos exactos del schema, índices parciales nativos (los usamos para "una semana, una estancia"). Prisma exige engine binario y no expresa índices parciales sin SQL a mano |
| Estilos | Tailwind v4 con tokens en `@theme` (`src/app/globals.css`) | Un solo lugar de tokens. Sin shadcn: los componentes base son propios y pocos |
| Auth | Clerk (Apple, Google, email) | Spec §6. Roles NO viven en Clerk: viven en `user_roles` y el modo activo en `users.active_context` |
| Validación | Zod 4 en bordes (actions, route handlers, env) | |
| Datos server | Server Components + Server Actions; TanStack Query solo en vistas con refresco (agenda proveedor, notificaciones) | Menos JS en cliente |
| Tests | Vitest (reglas de dominio) + Playwright (390/768/1440) | Spec §51 |
| Estructura | `src/app` (rutas) · `src/domains/*` (reglas + acciones + componentes de dominio) · `src/core` (env, rbac, contexto, eventos) · `src/integrations` (interfaces + adaptadores) · `src/db` · `src/ui` (componentes reutilizables sin dominio) | Spec §50 |

## Fases y compuertas
Cada fase cierra con `pnpm check` (typecheck + lint + tests + build) verde y capturas WebKit a 390/768/1440.

| Fase | Contenido | Compuerta |
|---|---|---|
| **0 Foundation** | Config, tokens, schema (28 tablas), Clerk, RBAC + contexto activo, FractionCoreClient local, interfaces de integración con adaptadores locales, seed DEMO, AppShell (tabbar/sidebar), `/api/health`, manifest PWA, docs mínimas | build verde, `db:push` + `db:seed` corren, health 200 |
| **1** | Splash + anillo, brand moment, rol, auth, perfil, intereses, permisos, welcome; Home owner/guest/provider; perfil agrupado; cambio de modo persistido | onboarding completo de punta a punta en WebKit 390 |
| **2** | Mis propiedades, detalle, fracciones, Mis semanas, Usar → Stay, Rentar → inventory, Intercambiar (beta) | no hay doble reserva: test de integración lo prueba |
| **3** | Estancias, preparar, modo "estoy aquí", invitados con deep link, Living Pass con QR firmado | invitado sin cuenta llega a la estancia |
| **4** | Explore, categorías, detalle de proveedor, booking con estados reales, PaymentProvider local | booking pasa por todos sus estados |
| **5** | Provider onboarding/verificación, Provider Home, agenda, jobs, ingresos | proveedor acepta y cierra un job con evidencia |
| **6** | Ingresos (estimado/pendiente/confirmado/pagado), incidencias, centro de notificaciones | |
| **7** | Operator Today/Tasks/Property, `/admin`, outbox de eventos y adaptadores documentados | |
| **8** | PWA (offline shell, instalable), performance, animaciones finales, accesibilidad, Playwright e2e, hardening | Core Web Vitals, e2e verde en 3 viewports |

## Comandos
```
pnpm install
pnpm dev
pnpm check          # typecheck + lint + test + build
pnpm db:push        # aplica el schema a DATABASE_URL
pnpm db:seed        # datos DEMO (marcados is_demo=true)
pnpm test:e2e       # Playwright
```

## Lo que NO se hace
- No se conecta Airbnb/Booking/Expedia sin credenciales: solo `ChannelManagerProvider` + adaptador local.
- No se cobra de verdad hasta que exista `STRIPE_SECRET_KEY` y Luis lo autorice: `PaymentProvider` local registra pagos como DEMO.
- No se inventan ratings, pagos ni rendimientos. Los estimados se etiquetan "estimación".
- No se simula apertura de cerraduras.
