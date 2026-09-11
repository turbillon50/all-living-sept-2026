# INTEGRATIONS — interfaces y adaptadores

Regla (spec §36, §53): ninguna integración falsa. Cada capacidad externa tiene una interfaz en `src/integrations/<nombre>/` y al menos un adaptador **local** claramente marcado. El adaptador real se activa solo cuando existe la credencial en entorno.

| Interfaz | Adaptadores | Estado | Se activa con |
|---|---|---|---|
| `FractionCoreClient` | `LocalFractionCore` (Neon) | MVP | siempre |
| `PaymentProvider` | `LocalPaymentProvider` (registra pago DEMO, nunca cobra) · `StripePaymentProvider` (pendiente) | local | `STRIPE_SECRET_KEY` |
| `ChannelManagerProvider` | `LocalChannelManager` (guarda inventario, no publica) · Airbnb/Booking/Expedia (pendientes, sin API autorizada) | local | credenciales de PMS |
| `NotificationProvider` | `InAppNotificationProvider` (tabla `notifications`) · Web Push (fase 8) · Resend correo (pendiente) | local | `RESEND_API_KEY`, VAPID |
| `MessagingProvider` | `LocalMessagingProvider` (hilos en DB) · WhatsApp/Twilio (pendiente) | local | credenciales Twilio |
| `AccessControlProvider` | `LocalAccessControl` (tokens firmados, sin cerradura física) · smart lock (pendiente) | local | credenciales del fabricante |
| `MapsProvider` | `StaticMapsProvider` (coordenadas, sin tiles) · Mapbox (pendiente) | local | `MAPBOX_TOKEN` |

## Eventos de dominio (outbox `domain_events`)
`fraction.created`, `fraction.sold`, `ownership.transferred`, `week.claimed`, `week.released`, `stay.created`, `stay.started`, `stay.completed`, `guest.invited`, `inventory.released`, `rental.booked`, `service.requested`, `service.confirmed`, `service.completed`, `payment.completed`, `provider.approved`, `incident.created`, `incident.resolved`.

Se escriben en la misma transacción que el cambio. Un publicador (fase 7) los entrega a Fraction Core / V&LIVING / PMS por adaptador.

## Lo que devuelve ALL LIVING hacia Fraction Core (fase 7)
ocupación · ADR · renta real · costos · servicios consumidos · satisfacción · incidencias · rendimiento, agregados por fracción y propiedad, solo con cifras realizadas (status `paid`/`confirmed`).
