# INTEGRATIONS — interfaces y adaptadores

Regla (spec §36, §53): ninguna integración falsa. Cada capacidad externa vive en `src/integrations/<nombre>/`. Los adaptadores **locales** se identifican como tales; los catálogos externos no se sustituyen por resultados inventados. El adaptador real requiere credenciales y una implementación completa para cada operación habilitada.

| Interfaz | Adaptadores | Estado | Se activa con |
|---|---|---|---|
| `FractionCoreClient` | `LocalFractionCore` (Neon) | MVP | siempre |
| `PaymentProvider` | `LocalPaymentProvider` (registra pago DEMO, nunca cobra) · `StripePaymentProvider` (pendiente) | local | implementar Stripe; la clave sola no habilita cobros |
| `ChannelManagerProvider` | `LocalChannelManager` (guarda inventario, no publica) · Airbnb/Booking/Expedia (pendientes, sin API autorizada) | local | credenciales de PMS |
| `NotificationProvider` | `InAppNotificationProvider` (tabla `notifications`) · Web Push (fase 8) · Resend correo (pendiente) | local | `RESEND_API_KEY`, VAPID |
| `MessagingProvider` | `LocalMessagingProvider` (hilos en DB) · WhatsApp/Twilio (pendiente) | local | credenciales Twilio |
| `AccessControlProvider` | `LocalAccessControl` (tokens firmados, sin cerradura física) · smart lock (pendiente) | local | credenciales del fabricante |
| `MapsProvider` | `StaticMapsProvider` (coordenadas, sin tiles) · Mapbox (pendiente) | local | `MAPBOX_TOKEN` |
| Duffel | sugerencias de aeropuertos y búsqueda de ofertas | búsqueda real activa | `DUFFEL_ACCESS_TOKEN` |
| Reloadly | catálogo de operadores de recargas y tarjetas de regalo | catálogo real activo | `RELOADLY_CLIENT_ID`, `RELOADLY_CLIENT_SECRET`; `RELOADLY_ENV=live` o `sandbox` |
| Viator | búsqueda afiliada de tours y actividades | conexión preparada; navegación en definición | `VIATOR_API_KEY`, `VIATOR_ENV=production` o `sandbox` |

## Viator — conexión preparada, 17 de septiembre de 2026

Las llaves de sandbox y producción se validaron contra `/destinations` y `/products/search` de sus respectivos entornos. Vercel `all-living` tiene `VIATOR_API_KEY` cifrada por entorno y `VIATOR_ENV` independiente. No se configuró Viator en el proyecto de Events.

El adaptador preparado usa únicamente `/products/search` y `/search/freetext`, con idioma español, MXN, fecha, destino, orden, cancelación gratuita y paginación. Conserva `productUrl` con su atribución de afiliado. Incluye en el precio de referencia los cargos en destino cuando Viator los informa. La consulta se almacena cinco minutos en la caché del servidor, limita el tiempo de espera y distingue errores de resultados vacíos. No permite reservar ni cobrar mediante la API.

El acceso de la cuenta es básico; Full + Booking sigue en revisión. El flujo disponible termina la reserva y el pago en Viator. El borrador de interfaz en `/services/tours` y su acceso desde `/services` están sujetos a la nueva definición de producto de Luis: experiencias de marca blanca y curadas, y hospedaje de marca blanca y curado. La ubicación de estas líneas todavía está por definir. Este documento no certifica publicación ni pruebas completas de interfaz.

## Vuelos, recargas y regalos — 16 de septiembre de 2026

Duffel está disponible en `/flights`, con `/api/flights/places` y `/api/flights/search`. Preview usa una clave de pruebas y producción una clave live. Se verificó una búsqueda MEX–CUN para el 20 de octubre de 2026, un adulto, con ofertas reales en producción. Todavía no se implementan reserva, cobro ni emisión de boletos.

Reloadly se consulta desde `/tarjetas`, con entrada principal en la navegación de viaje. `/recargas` conserva enlaces anteriores y abre la categoría de tiempo aire. `GET /api/reloadly/catalog` acepta `kind=topups|giftcards`, `country=MX` y `page=1`. La pantalla abre primero tarjetas de regalo, destaca marcas reales como Airbnb, Amazon y Google Play cuando aparecen en la consulta, y permite elegir país, cambiar a tiempo aire, expandir detalles y paginar. OAuth se gestiona exclusivamente en el servidor, por audiencia; el catálogo se guarda en caché cinco minutos y la autenticación se renueva antes de expirar. Preview y producción usan el catálogo live, sin operaciones de compra.

Solo se publican campos de catálogo permitidos. Los montos de las tarjetas son valores nominales en la moneda del destinatario; los costos mayoristas de las recargas no se presentan como saldo local. Se conservan país, moneda y condiciones del producto, incluso en productos globales. Las credenciales, comisiones y costos del proveedor no se devuelven al navegador. Una consulta inicial para México devolvió 10 operadores y 31 tarjetas; las cantidades dependen del catálogo vigente. Compras, entrega y envío de recargas requieren una fase posterior con pagos, cotización, idempotencia y conciliación.

## Eventos de dominio (outbox `domain_events`)
`fraction.created`, `fraction.sold`, `ownership.transferred`, `week.claimed`, `week.released`, `stay.created`, `stay.started`, `stay.completed`, `guest.invited`, `inventory.released`, `rental.booked`, `service.requested`, `service.confirmed`, `service.completed`, `payment.completed`, `provider.approved`, `incident.created`, `incident.resolved`.

Se escriben en la misma transacción que el cambio. Un publicador (fase 7) los entrega a Fraction Core / V&LIVING / PMS por adaptador.

## Lo que devuelve ALL LIVING hacia Fraction Core (fase 7)
ocupación · ADR · renta real · costos · servicios consumidos · satisfacción · incidencias · rendimiento, agregados por fracción y propiedad, solo con cifras realizadas (status `paid`/`confirmed`).

## Experiencia de vuelos y tarjetas — revisión de septiembre de 2026

La mejora en preview pone Hospedaje, Vuelos, Tarjetas y Experiencias al mismo nivel. Se conserva el Master visual, el símbolo Möbius y los modos operativos. El acceso a cuenta permanece en el encabezado.

El buscador de vuelos incorpora sugerencias de ciudades/aeropuertos, ida y vuelta, intercambio de origen/destino, fechas visibles, viajeros adultos y cabina. La carga tiene animación y skeletons que respetan movimiento reducido. Los resultados muestran logos reales de los campos Duffel, ida y regreso, duración, escalas, tarifa total para todos los adultos, moneda y detalles de itinerario/equipaje por pasajero y segmento. Los logos identifican las ofertas; no se afirma un convenio comercial directo con la aerolínea.

Se comparan todas las ofertas recibidas (con presentación progresiva de 12), sin mezclar monedas, y se filtran aerolíneas/escalas. Se conserva la hora local del aeropuerto sin convertirla a la zona del navegador. Las ofertas vencidas se retiran; una consulta nueva actualiza la disponibilidad. La API valida fechas reales, orden ida/regreso, origen distinto al destino y 1–9 adultos, limita la espera y devuelve errores sin respuestas internas del proveedor. Sólo publica los campos usados por la experiencia.

La búsqueda Duffel anterior sigue activa en producción. Esta mejora visual y el catálogo Reloadly requieren aprobación de publicación y verificación posterior del dominio. No habilitan cobro, emisión, compra ni entrega.
