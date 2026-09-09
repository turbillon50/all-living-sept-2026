# 03 · Plan de arranque — fases, compuertas, decisiones

Método: VForge Method V1 (skill `vforge-method`). Ninguna fase se da por terminada sin las tres evidencias en producción: visual (captura WebKit 390 y 1440), funcional (el flujo hace lo que debe) y operativa (deploy READY, `/api/health`, dominio, correo entrega). Cada fase candadeada se registra en el Brain con evidencia.

**Reloj:** entrega de ATTIK en **diciembre 2026**. Hoy es 09-sep-2026. Doce semanas.

## Decisiones que solo Luis puede tomar (bloquean lo que sigue)
1. **Alcance.** ¿ALL LIVING es la operación post-firma (este blueprint) o algo más? Si es otra cosa, se corrige `docs/02` antes de la primera línea de código.
2. **Marca.** Nombre final (ALL LIVING / All Living / ALL·LIVING), logo, paleta, tipografía. Sin esto no hay F1.
3. **Dominio.** Libres hoy en name.com: `allliving.mx` y `all-living.mx` (49.99 USD), `allliving.io` (53.99), `allliving.life` (3.99), `allliving.site` (2.99). `allliving.com` es premium (5,211.80 USD). Recomendación: `allliving.mx` + `allliving.site` de respaldo; se compra por API en F3.
4. **Relación con V&LIVING.** Clerk propio con SSO, o la misma app Clerk de vliving. Recomendación: app propia; el titular no es el mismo público que el navegante de vliving.site.
5. **TypeScript o JavaScript.** Recomendación: TS. vliving es JS; portar cuesta un día y evita bugs de dinero.
6. **Node 22 en Vercel** (Mastra y librerías nuevas lo piden) o Node 20 estricto como vliving. Recomendación: 22 en Vercel, 20 local hasta migrar nvm.
7. **Cuota de servicios por fracción para ATTIK.** El paquete valuado da $144,555/año por fracción; el monto de la cuota lo fija Luis. Sin monto no hay estado de cuenta real.
8. **GO legal.** Mientras las compuertas del compendio no cierren, la app nace con cobro apagado y sin la palabra "apartada". Eso no bloquea construir; bloquea cobrar.
9. **Tareas que dan puntos** y **beneficios canjeables** iniciales (hoy `vl_beneficios` está vacío y `vl_tareas` solo tiene "registro" = 50 pts).

## Fases

### F0 · Discovery — HECHA (este PR)
Blueprint, README maestro, inventario, arquitectura. Compuerta: existe blueprint + README maestro. ✔

### F1 · Diseño navegable — semana 1
- Marca con `higgsfield-brandkit` + `paleta-luis` a partir de la decisión 2.
- Demo navegable de las 6 pantallas del titular (inicio, calendario, estancia, conserjería, beneficios, cuenta) y 3 de la casa (bandeja, calendario maestro, titular) con `demo-screens` (datos duros, sin backend). Se aprueba en WebKit a 390 px.
- Compuerta: Luis aprueba el flujo con capturas.

### F2 · Repo y Vercel — semana 1
- Proyecto Vercel `all-living`, conectado a este repo, `main` = producción, preview por PR. Candado de escala en el build desde el primer commit.
- Compuerta: deploy READY de una página con `/api/health`.

### F3 · Infraestructura — semana 2
- Neon propio con `lib/schema.ts` idempotente. Clerk app propia. Resend dominio verificado. Dominio comprado y DNS a Vercel (`dns-manager`). Secretos por `secret-injector`.
- Compuerta: dominio con SSL, Clerk entra, Neon responde, correo de prueba real entregado.

### F4 · Build del núcleo — semanas 2 a 6
Orden dictado por dependencias, no por vistosidad:
1. M1 titulares + participaciones + hitos (semilla ATTIK real desde `vl_*`).
2. M2 calendario 294/70/1 con rotación (aquí se prueba con un caso que **debe fallar**: 15 fracciones o 295 días tiene que reprobar).
3. M3 estancias con disparadores (traslados, actividades, checklist).
4. M4 conserjería (bandeja + chat + correo + WhatsApp).
5. M5 beneficios y canjes.
6. M8 cuotas y estado de cuenta (cobro apagado).
- Compuerta por módulo: migración corrida, datos reales, `/api/health` verde, captura WebKit.

### F5 · Administración — semanas 5 a 7
Panel de la casa con el checklist de `product-standard`: CRUD real, métricas de la base, cambio de estado visible al titular, bandeja, notas. Apps de chofer y operador (M6, M7) como vistas del mismo panel, mobile-first.

### F6 · Integraciones — semanas 7 a 9
Twilio/WhatsApp, Stripe + Mercado Pago (probados en modo test, candado cerrado), push VAPID, Mapbox trayectos, Viator para el catálogo de experiencias, generación de PDF. Lutor para la Sala de Cierre si el corpus legal está listo.

### F7 · QA — semanas 9 a 10
`qa-tester-team` + `manifiesto-app` + `pwa-checklist` en WebKit. Cero críticos/altos. Las 6 skills de WebKit están vivas (ver riesgo 1).

### F8 · Producción — semanas 11 a 12
Dominio, SSL, base, correos, panel, app pública, PWA instalada en el iPhone de Luis, documentación, cron de salud. Registro en el Brain. Compuerta: las tres evidencias = cobrable (cuando el GO legal lo permita).

## Riesgos medidos
1. **QA visual.** Las 6 skills de WebKit fallaban por un build de Playwright faltante. Arreglado el 09-sep; las 6 dan OK. Si vuelven a caer, revisar la caché de navegadores de Playwright antes que nada.
2. **Disco del servidor.** Estaba al 99 %; quedó al 92 % tras limpiar worktrees viejos. Los worktrees activos de esta semana pesan 10 GB; conviene un store compartido de pnpm o borrarlos al mergear.
3. **NO-GO legal.** Ninguna fecha de este plan depende de recibir dinero. Si el GO llega antes, se levanta un flag; si no llega, la app opera igual.
4. **Un solo Luis.** Las 9 decisiones de arriba son de él. Todo lo demás lo hace la maquinaria sin preguntar.
5. **Datos `vl_*` dentro del Brain.** ALL LIVING no agrava la deuda: nace en su Neon. La semilla se lee una vez y ya.
6. **Mastra / Node 22.** Si el conserje conversacional necesita bucle de agente, hay que subir a Node 22; se decide en F3 para no descubrirlo en F6.
