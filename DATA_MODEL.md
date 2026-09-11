# DATA_MODEL — ALL LIVING

Schema en `src/db/schema/*.ts` (Drizzle, PostgreSQL en Neon). Todas las tablas: `id uuid`, `created_at`, `updated_at`. Las tablas con datos sembrados llevan `is_demo` para que nada ficticio pase por real.

## Tablas (28)
| Dominio | Tablas |
|---|---|
| Identidad | `users` (clerk_id, active_context), `user_profiles` (member_id, intereses, permisos progresivos), `user_roles` (rol + scope; un usuario, varios roles) |
| Propiedades | `properties`, `property_media` |
| Fracciones | `fractions` (F07 por propiedad), `fraction_ownerships` (histórico, `active` + `transferred_at`), `fraction_weeks` (año, semana, temporada, estado) |
| Estancias | `stays`, `stay_guests` (permisos por invitado) |
| Proveedores | `providers` (status draft→approved), `provider_services`, `provider_service_areas`, `provider_availability` |
| Bookings | `service_bookings`, `booking_status_history` (append-only), `payments`, `payouts` |
| Renta | `rental_inventory` (semana liberada), `rental_bookings` |
| Finanzas | `expenses`, `income_entries` (status estimated/pending/confirmed/paid) |
| Operación | `notifications`, `incidents`, `access_tokens` (hash, expiración), `reviews`, `documents`, `audit_logs`, `domain_events` (outbox) |

## Invariantes (en base de datos, no solo en UI)
- **Una semana no se asigna dos veces.** `fraction_weeks` única por (fracción, fecha_inicio) y por (fracción, año, semana). `stays` tiene índice único parcial sobre `fraction_week_id` donde `status <> 'cancelled'`. `rental_inventory` única por `fraction_week_id`.
- **La titularidad es histórica.** `fraction_ownerships` nunca se sobrescribe: índice único parcial "una fila activa por fracción"; transferir = cerrar fila (`transferred_at`, `active=false`) + abrir otra, en una transacción, con `audit_logs`.
- **Estados reales.** Enums de Postgres para semana, estancia, booking, pago, proveedor, incidencia, dinero.
- **Estimado ≠ realizado.** `income_entries.status` y `expenses.status` separan estimated / pending / confirmed / paid. La UI nunca los suma en la misma cifra.
- **QR sin datos sensibles.** `access_tokens` guarda solo el hash; el token firmado (jose, HS256, `ACCESS_TOKEN_SECRET`) expira y se revoca.
- **Auditoría.** `audit_logs` en ownership, pagos, accesos, aprobación de proveedor y cambios de estado de semana.

## Fraction Core
El resto de la app no consulta `fractions`, `fraction_ownerships` ni `fraction_weeks` directamente: pasa por `FractionCoreClient` (`src/domains/fractions/fraction-core.ts`). La implementación MVP es local sobre Neon; el contrato permite volverlo servicio aparte.

## Migraciones
`pnpm db:generate` produce SQL en `drizzle/`; `pnpm db:push` aplica en desarrollo; en producción se aplican las migraciones generadas (`pnpm db:migrate`).
