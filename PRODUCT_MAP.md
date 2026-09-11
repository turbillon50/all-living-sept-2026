# PRODUCT_MAP — rutas y pantallas

Navegación pública (tabbar móvil / sidebar escritorio):
- OWNER / GUEST: Inicio `/home` · Estancias `/stays` · Explorar `/explore` · Servicios `/services` · Perfil `/profile`
- PROVIDER: Inicio `/pro` · Servicios `/pro/services` · Ingresos `/pro/earnings` · Perfil `/profile`
- OPERATOR: `/ops` con navegación propia. ADMIN: `/admin`, nunca en tabbar.

| # | Pantalla (spec §45) | Ruta | Fase |
|---|---|---|---|
| 01 | Splash + anillo | `/` | 1 |
| 02 | Brand onboarding | `/welcome` | 1 |
| 03 | Role selection | `/welcome/role` | 1 |
| 04 | Auth | `/sign-in`, `/sign-up` (Clerk) | 1 |
| 05 | Create profile | `/onboarding/profile` | 1 |
| 06 | Interests | `/onboarding/interests` | 1 |
| 07 | Permissions | `/onboarding/permissions` | 1 |
| 08 | Welcome | `/onboarding/done` | 1 |
| 09 | Owner Home | `/home` (contexto owner) | 1 |
| 10 | Guest Home | `/home` (contexto guest) | 1 |
| 11 | Provider Home | `/pro` | 5 |
| 12 | Properties | `/properties` | 2 |
| 13 | Property Detail | `/properties/[id]` | 2 |
| 14 | Fractions | `/properties?tab=fractions` | 2 |
| 15 | Fraction Detail | `/fractions/[id]` | 2 |
| 16 | My Weeks | `/weeks` | 2 |
| 17 | Week Detail | `/weeks/[id]` | 2 |
| 18 | Use Week | `/weeks/[id]/use` | 2 |
| 19 | Release for Rent | `/weeks/[id]/release` | 2 |
| 20 | Exchange | `/weeks/[id]/exchange` | 2 |
| 21 | Stays | `/stays` | 3 |
| 22 | Stay Detail | `/stays/[id]` | 3 |
| 23 | Prepare Stay | `/stays/[id]/prepare` | 3 |
| 24 | In-Stay Mode | `/stays/[id]` (estado in_progress) | 3 |
| 25 | Guests | `/stays/[id]/guests` | 3 |
| 26 | Invite Guest | `/stays/[id]/guests/invite` · aceptación `/i/[token]` | 3 |
| 27 | Explore | `/explore` | 4 |
| 28 | Destination | `/explore/[destination]` | 4 |
| 29 | Services | `/services` | 4 |
| 30 | Service Category | `/services/[category]` | 4 |
| 31 | Provider Detail | `/providers/[slug]` | 4 |
| 32 | Service Booking | `/book/[serviceId]` | 4 |
| 33 | Booking Confirmation | `/bookings/[id]` | 4 |
| 34 | Living Pass | `/pass` | 3 |
| 35 | Notifications | `/notifications` | 6 |
| 36 | Income Overview | `/income` | 6 |
| 37 | Statement Detail | `/income/[period]` | 6 |
| 38 | Provider Onboarding | `/pro/onboarding` | 5 |
| 39 | Provider Verification | `/pro/verification` | 5 |
| 40 | Provider Calendar | `/pro/calendar` | 5 |
| 41 | Provider Job Detail | `/pro/jobs/[id]` | 5 |
| 42 | Provider Earnings | `/pro/earnings` | 5 |
| 43 | Support | `/support` | 6 |
| 44 | Incident Create | `/incidents/new` | 6 |
| 45 | Incident Detail | `/incidents/[id]` | 6 |
| 46 | Profile | `/profile` | 1 |
| 47 | Preferences | `/profile/preferences` | 1 |
| 48 | Payments | `/profile/payments` | 4 |
| 49 | Security | `/profile/security` | 1 |
| 50 | Role Switcher | `/profile/mode` | 1 |
| 51 | Operator Today | `/ops` | 7 |
| 52 | Operator Property | `/ops/properties/[id]` | 7 |
| 53 | Operator Tasks | `/ops/tasks` | 7 |
| 54 | Offline | `/offline` | 8 |
| 55 | Error states | `error.tsx`, `not-found.tsx`, `/maintenance`, componentes de estado | 8 |

Admin: `/admin`, `/admin/providers`, `/admin/properties`, `/admin/incidents`, `/admin/users`, `/admin/bookings`, `/admin/audit`.

API: `/api/health` · `/api/fraction-core/*` (contrato interno) · `/api/webhooks/clerk` · `/api/webhooks/payments` (cuando exista adaptador real).

## Principio de la Home
Responde "¿qué está pasando conmigo, mi propiedad o mi próxima estancia?". Hero con saludo y contexto; tres acciones (USAR · RENTAR · INTERCAMBIAR); fila de servicios (Preparar estancia · Concierge · Transporte · Chef · Yate); después próximas estancias, actividad y sugerencias. Sin gráficas financieras.
