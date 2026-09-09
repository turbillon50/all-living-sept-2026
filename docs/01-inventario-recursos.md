# 01 · Inventario de recursos — medido el 09-sep-2026

> Este repo es público. La versión completa de este inventario (IDs de proyectos, rutas del servidor, nombres de credenciales, estado legal detallado) vive en el Brain de Vulcano y no aquí. Lo de abajo es lo que sí puede leer cualquiera.

## 1. Lo que ya existe y sirve directo

### 1.1 `vliving-2026` — producción, vliving.site
Next 16 App Router + Pages API, React 19, Clerk, Neon (driver HTTP), Vercel Blob, Leaflet, centrifuge, web-push, jsPDF. Cerca de 300 archivos de app y 68 endpoints.

Piezas que ALL LIVING reutiliza tal cual o porta (ruta dentro de `vliving-2026`):

| Pieza | Dónde | Por qué sirve |
|---|---|---|
| Constantes de negocio dictadas por Luis (14 fracciones, 3 semanas, temporadas alta/media/baja) | `lib/negocio.js` | Fuente de verdad del calendario |
| Esquema fractional (calendario, disponibilidad, documentos como jsonb) | tablas `vl_fractional`, `vl_fracciones` | Punto de partida del modelo de titulares |
| Verificación Clerk server-side por JWKS | `pages/api/_auth.js` | Auth sin SDK pesado, probado en prod |
| Propone → confirma → ejecuta con token HMAC, registro de cada acción, candado de acciones prohibidas | `pages/api/manos.js`, `lib/manos-registro.js`, `components/CartaAccion.js` | Patrón de conserjería con confirmación del titular |
| Salas de chat con miembros, adjuntos, reacciones | `lib/vliving-schema.js`, `pages/api/salas.js`, `components/SalaChat.js` | Canal titular ↔ conserjería, ya con realtime |
| Realtime (centrifuge) y push VAPID | `lib/realtime-server.js`, `lib/use-realtime.js`, `lib/push-server.js` | Avisos de estancia, traslado, solicitud |
| Cobro con candado central `COBRO_ACTIVO=false`, Stripe por REST | `pages/api/pago.js`, `pages/api/stripe-webhook.js` | El cobro se apaga en un solo lugar |
| Documentos del dueño a Blob con estado y nota | `pages/api/docs.js` | Expediente del titular |
| Mensajería dueño ↔ equipo con antiflood | `pages/api/mensajes.js` | Comunicación real persistida |
| Bitácora de precio obligatoria | `vl_precio_historial` | Toda cuota o precio cambia con rastro |
| Expediente PDF de 5 páginas | `pages/api/expediente.js`, `lib/expediente-pdf.js` | Estado de cuenta imprimible |
| Tokens de diseño (cristal, movimiento, escala tipográfica) con candado en el build | `app/tokens.css`, `scripts/verificar-escala.mjs`, `DISENO-ESCALA.md` | El candado se hereda; la paleta no |
| Háptico con `prefers-reduced-motion` | `lib/haptico.js` | PWA premium en iPhone |
| Contenido editable desde DB con respaldo en código | `lib/contenido.js` | Copy legal editable sin deploy |
| Motor & con memoria por usuario y vocabulario legal cargado | `pages/api/v-chat.js`, `lib/nucleo.js`, `lib/selector.js` | Conserje conversacional |

### 1.2 Inventario Case 001 (ATTIK, Tulum, entrega dic-2026)
18 unidades y 252 fracciones ya cargadas en las tablas de V&LIVING, con la regla que no se rompe: venta completa cotiza en USD, fracción en MXN, jamás se cruzan. Lo público está en vliving.site.

### 1.3 Marco legal ya aprobado (no se reinventa)
- Compendio Maestro Fractional / Cierre Legal v6 (22-ago-2026). Mientras no cierren sus compuertas, **no se recibe dinero** y no se dice "apartada". Detalle en el Brain.
- Calendario decidido por Luis: 14 × 3 configurable, 294 días titulares + 70 operativos + 1 de ajuste (2 en bisiesto), sin decimoquinta participación.
- Instrumento: promesa de cesión de derechos fiduciarios; nadie es fideicomisario hasta que el fideicomiso exista. Tres piezas negociadas de antemano: apartado, enganche, plazos.
- Vocabulario obligatorio y frenos de copy: íntegros en `AGENTS.md`.

### 1.4 Paquete de beneficios (dictado por Luis el 14-ago-2026)
Esenciales: traslado aeropuerto ida y vuelta en cada una de las 3 estancias · conserjería 24/7 · choferes con flotilla propia · gestión de boletos y reservaciones · una actividad por persona registrada por estancia, hasta 6 personas por fracción · administración, limpieza, preparación y operación de renta. Accesorios: restaurantes y experiencias con descuento. Con costo: niñeras, parrilleros, eventos, pet friendly. Valuación publicada en vliving.site: $144,555 MXN/año por fracción.

### 1.5 Motores que alimentan sin tocar
Zonas medidas, mercados SHF oficiales, V-Index y encaje de zona (`lib/vengine.js`), las 8 lecturas (`lib/lecturas.js`), geocodificación, "qué hay cerca". ALL LIVING los consume por API; no los duplica.

## 2. Repos relacionados
- `vliving-plataforma` — la app anterior (Vite SPA). Referencia para portar; no se despliega.
- `vliving-app` (jun-2026) — PWA estilo Airbnb con datos mock. Referencia de flujo, no base de código.
- `vliving-admin` — panel del equipo (Vite). Patrón de auth por rol.
- `lutor` — Legal Intelligence con corpus ATTIK. Candidato para la Sala de Cierre.
- `vmomentum-panel-core`, `admin-panel-template` — panel admin universal para transplantar.

## 3. Infraestructura (resumen)
Servidor Hetzner de la casa (12 CPU, 22 GB; disco liberado del 99 % al 92 % en esta sesión), Node 20 local, Vercel para deploy, Neon para datos (ALL LIVING nace en proyecto propio, no en el Brain), MetaMCP como gateway de herramientas. GPU remota aparcada por decisión de Luis. Dominios libres al 09-sep: `allliving.mx`, `all-living.mx`, `allliving.io`, `allliving.life`, `allliving.site`; `allliving.com` es premium.

## 4. Integraciones con llave viva (solo nombres de servicio)
Clerk, Neon, Vercel, GitHub, name.com, Resend, Twilio, Stripe, Mercado Pago, Mapbox, Google Maps, Gemini, OpenRouter, ElevenLabs, HeyGen, Viator, VAPID, v0, Stitch. Sin credenciales: DocuSign, Sumsub.

## 5. El arsenal (skills)
112 entradas en el vault; 92 verificadas. Las 6 de QA visual en WebKit estaban rotas y se arreglaron en esta sesión (causa: build de WebKit faltante en Playwright). Quedan rotas: `leer-pdf` (servicio puente ausente), `infra-monitor` (disco), `docusign-firma` y `sumsub-kyc` (sin credenciales).

Skills que ALL LIVING usa en orden: `vforge-method`, `spec-maxima`, `product-standard`, `stack-recomendado`, `fabrica-app-minima`, `secret-injector`, `dns-manager`, `clerk-automation`, `push-notifications`, `integrate-stripe`, `pwa-checklist`, `icono-pwa`, `manifiesto-app`, `revision-merge-deploy`, `rollback`, `salud-app`, `qa-tester-team`.

## 6. Brain
Memorias que definen este proyecto: 3344 (beneficios ALL LIVING), 3339 (estructura de adquisición), 3635 (compendio legal), 3644 (estado V&LIVING al 22-ago), 3907/3908 (Ley del Expediente), 4061 (esta sesión). Doctrina vigente: `DOCTRINA.md` v6.1.
