# 02 · Blueprint — qué se construye

## 0. La frase que ordena todo
**V&LIVING vende la parte. ALL LIVING opera la vida en esa parte.** Todo lo que pase antes de la firma es V&LIVING. Todo lo que pase después (llegar, quedarse, pedir, pagar la cuota, ver tu expediente, saber qué semana te toca el año que entra) es ALL LIVING.

Nada existe en ALL LIVING sin su titular, su fracción y su documento. Igual que en V&LIVING nada existe sin su medición.

## 1. Quién entra (roles reales, no "usuarios")
| Rol | Quién es | Qué hace en la app |
|---|---|---|
| **Titular** | Persona con una participación documentada (o en proceso: interés → promesa → adhesión) | Ve su calendario, reserva sus estancias, registra a sus hasta 6 personas, pide a conserjería, canjea beneficios, ve su estado de cuenta y su expediente |
| **Acompañante** | Una de las 6 personas registradas por el titular | Recibe itinerario y traslados, pide su actividad, sin acceso a lo financiero |
| **Conserje** | Equipo 24/7 de All Global | Bandeja de solicitudes, agenda, asignación de choferes y proveedores, chat con el titular, notas |
| **Chofer** | Flotilla propia | Trayectos del día, confirmación de recogida y entrega, incidencias |
| **Operador de unidad** | Limpieza, preparación, mantenimiento | Checklist por llegada/salida, inventario, incidentes con foto |
| **Aliado / proveedor** | Restaurantes, yates, golf, spa, autos | Catálogo y convenio, confirma canjes, factura a la casa |
| **Administración (la casa)** | All Global Holding | Todo: unidades, fracciones, cuotas, conciliación, documentos, hitos de derechos, métricas reales, auditoría |
| **Broker / referidor** | Quien trajo al titular (árbol `vl_red` de V&LIVING) | Solo lectura de sus referidos y su estado; no toca operación |

Multirol como en V&LIVING: la interfaz nunca pregunta "¿qué eres?"; la misma persona puede ser titular en ATTIK y aliado en otro proyecto. Rol = fila en `al_roles_usuario`, no una app distinta.

## 2. Módulos (cada uno con su tabla, su endpoint y su pantalla)

### M1 · Titulares y participaciones
Registro de cada participación con su **estado de derechos**: `interes` → `promesa_firmada` → `pago_conciliado` → `aceptacion_fiduciaria` → `adhesion` (los hitos exactos los fija el documento de cada proyecto). Cada cambio de estado con actor, fecha y documento que lo respalda. Sin hito documentado no hay derecho, y la app lo dice tal cual.

### M2 · Calendario de semanas
14 fracciones × 3 semanas (alta, media, baja) por unidad. **294 días titulares + 70 operativos + 1 de ajuste (2 en bisiesto)**, rotación anual, configurable por proyecto. Genera el calendario del año, lo publica al titular, permite intercambios entre titulares con aprobación de la casa, y bloquea los 70 días operativos para renta/mantenimiento. Las temporadas salen de `TEMPORADAS` en `lib/negocio.js` de vliving; se mueven a tabla `al_temporadas` por proyecto.

### M3 · Estancias
El titular reserva una estancia dentro de sus semanas: fechas, personas (hasta 6), vuelos, preferencias. La estancia dispara automáticamente: 2 traslados (llegada y salida), 1 actividad por persona registrada, checklist de preparación de la unidad, y aviso a conserjería. Estado: `planeada` → `confirmada` → `en_curso` → `cerrada`, con itinerario compartible.

### M4 · Conserjería 24/7
Bandeja única de solicitudes (`al_solicitudes`): tipo (traslado, reservación, boleto, medicamento, cena, insumo, actividad, otro), prioridad, SLA, asignado a, estado, hilo de mensajes. El titular pide por chat (patrón `manos.js`: el conserje digital propone, el titular confirma, entonces se ejecuta) o por WhatsApp (Twilio) y ve la misma solicitud en la app. Cada solicitud queda en Neon y avisa por correo (Resend) al equipo: es la regla de `product-standard`.

### M5 · Beneficios y aliados
Catálogo con tres capas exactamente como las dictó Luis: **esenciales** (incluidos), **accesorios** (descuento por consumo), **con costo**. Cada beneficio con su valor de mercado (para que el titular vea cuánto ahorró en el año: la cifra $144,555 sale de aquí, medida por canje real, no pintada). Aliados con convenio, vigencia y forma de confirmar el canje (QR o folio). `vl_beneficios` / `vl_beneficios_canjes` de vliving son el esqueleto; aquí se completan.

### M6 · Flotilla y trayectos
Vehículos, choferes, trayectos programados desde las estancias (llegada/salida) y desde solicitudes. La flotilla crece con las fracciones colocadas: el módulo muestra capacidad vs demanda por semana para que la casa decida cuándo sumar unidad. App de chofer: vista del día, confirmar recogida, incidencia.

### M7 · Operación de la unidad
Checklist de preparación por llegada y de cierre por salida, inventario de la unidad, mantenimiento, incidentes con foto (Blob), y los 70 días operativos: renta operada por la casa con registro de ocupación y tarifa **medida** (nunca proyectada al titular; vocabulario legal).

### M8 · Cuotas y estado de cuenta
Cuota anual de servicios por fracción (monto por proyecto, decisión 7 del plan), cargos con costo, canjes, y lo que la casa liquide al titular cuando el documento lo prevea. Estado de cuenta mensual en PDF (porta `lib/expediente-pdf.js`). Pagos: Stripe y Mercado Pago listos en código, **candado central `COBRO_ACTIVO=false`** heredado de `pages/api/pago.js` hasta que Luis levante el NO-GO. Toda cifra que cambie deja rastro en `al_bitacora` (regla de `vl_precio_historial`).

### M9 · Expediente y Sala de Cierre
Documentos del titular (identificación, promesa, adhesión, comprobantes), estado KYC/PLD, hitos de derechos, y la Sala de Cierre privada donde se revisan documentos y se dan instrucciones de pago con folio y cuenta autorizada. Integra con `lutor` (Legal Intelligence, corpus ATTIK) para el libro de fuentes cuando exista. DocuSign y Sumsub quedan como integración futura: hoy no hay credenciales.

### M10 · Administración de la casa
Panel con CRUD real contra Neon, métricas leídas de la base, cambio de estados que el titular ve al instante, bandeja de entrada, notas y seguimiento por titular. Checklist "no sale sin esto" de `product-standard`. Se transplanta la estructura de `vmomentum-panel-core`; no se reescribe el `App.jsx` de 1,830 líneas de `vliving-admin`.

### M11 · Comunicación
Canal titular ↔ casa persistido (`al_mensajes`), realtime (centrifuge, ya en vliving), push VAPID, correo Resend como respaldo duro, WhatsApp por Twilio para el que no abre la app. Avisos automáticos: semana asignada, estancia confirmada, chofer en camino, solicitud resuelta, estado de cuenta listo, hito de derechos alcanzado.

### M12 · Multi-proyecto
ATTIK es Case 001, el primero de un pipeline. Toda tabla lleva `proyecto_id`; nada se escribe pensando en un solo edificio. Si una pantalla solo sirve para ATTIK, está mal construida (misma regla que en `AGENTS.md` de vliving).

## 3. Modelo de datos (prefijo `al_`, Neon propio)
```
al_proyectos        id, nombre, ubicacion, desarrollador, fiduciario, entrega, config jsonb (fracciones, semanas, dias_titulares, dias_operativos)
al_unidades         id, proyecto_id, num, tipo, m2, nivel, estado, fotos jsonb        ← se siembra desde vl_unidades (ATTIK, 18)
al_fracciones       id, unidad_id, numero, estado, titular_uid, precio, moneda        ← se siembra desde vl_fracciones (252)
al_temporadas       proyecto_id, clave, meses int[], peso
al_calendario       anio, fraccion_id, semana, temporada, inicio, fin, estado, intercambio_id
al_titulares        uid (Clerk), nombre, contacto jsonb, kyc_estado, fundador_num, referido_por
al_participaciones  id, fraccion_id, titular_uid, estado_derechos, documento_id, desde
al_hitos_derechos   participacion_id, hito, fecha, actor, documento_id, nota           ← append-only
al_personas         id, titular_uid, nombre, relacion, documento, activa               ← máx 6 por fracción, se valida en el endpoint
al_estancias        id, fraccion_id, titular_uid, llegada, salida, personas jsonb, vuelos jsonb, estado
al_traslados        id, estancia_id, tipo (llegada|salida|otro), hora, origen, destino, vehiculo_id, chofer_uid, estado
al_solicitudes      id, titular_uid, estancia_id, tipo, detalle, prioridad, sla_h, asignado_uid, estado, creado, resuelto
al_solicitud_msgs   solicitud_id, de_uid, texto, adjunto_url, creado
al_beneficios       id, proyecto_id, capa (esencial|accesorio|con_costo), clave, titulo, valor_mercado, unidad, cupo_por_estancia, aliado_id, activo
al_canjes           id, beneficio_id, titular_uid, estancia_id, persona_id, valor_aplicado, folio, estado, confirmado_por
al_aliados          id, nombre, giro, convenio jsonb, contacto jsonb, vigencia, activo
al_vehiculos        id, proyecto_id, placa, tipo, capacidad, activo
al_choferes         uid, nombre, telefono, vehiculo_id, activo
al_tareas_unidad    id, unidad_id, estancia_id, tipo (preparacion|cierre|mantenimiento), checklist jsonb, asignado_uid, estado, fotos jsonb
al_incidentes       id, unidad_id, estancia_id, descripcion, fotos jsonb, severidad, estado
al_ocupacion_op     unidad_id, fecha, ocupada bool, tarifa_medida, fuente               ← los 70 días operativos, solo medido
al_cuotas           id, participacion_id, concepto, monto, moneda, periodo, vence, estado
al_pagos            id, cuota_id, medio (stripe|mp|transferencia), referencia, folio, monto, conciliado_en, conciliado_por
al_estados_cuenta   id, titular_uid, periodo, pdf_url, generado_en
al_documentos       id, titular_uid, participacion_id, tipo, url, hash_sha256, estado, revisado_por, nota
al_mensajes         id, titular_uid, de (titular|casa), canal (app|whatsapp|correo), texto, adjunto_url, leido_en
al_avisos           id, uid, tipo, titulo, cuerpo, ref, enviado_push, enviado_correo, leido_en
al_roles_usuario    uid, rol, proyecto_id, estado, otorgado_por
al_bitacora         id, entidad, entidad_id, campo, antes, despues, actor, motivo, creado ← append-only, obligatoria en precio/cuota/estado
al_config           clave, valor jsonb                                                   ← COBRO_ACTIVO vive aquí y en código, ambos apagados
```
Convenciones heredadas de vliving: campo sin medir en `NULL`, jamás en `0`; migraciones idempotentes `CREATE TABLE IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` en `lib/schema.js`, corridas la primera vez que un endpoint las necesita; ninguna cifra de negocio en el código.

**Semilla real, no mock:** ATTIK se importa de `vl_unidades` + `vl_fracciones` + `vl_fractional` (economía, servicios, fideicomiso jsonb) por un script de una sola corrida. Los usuarios de `vl_red` con `numero_fundador` se conservan.

## 4. Stack
| Capa | Elección | Por qué (y qué se descartó) |
|---|---|---|
| Framework | **Next.js 16 App Router + Route Handlers, TypeScript** | Mismo Next que vliving para portar sin fricción; TS porque `stack-recomendado` lo exige y este proyecto maneja dinero y derechos. Node 20 en local, 22 en Vercel (Mastra y librerías nuevas ya piden ≥22; se decide en F3). |
| Base | **Neon, proyecto propio**, driver HTTP `@neondatabase/serverless`, SQL a mano como vliving | Doctrina §5: cada app su Neon. Sin ORM para no pelear con el driver HTTP; si Luis prefiere Drizzle, se decide en F3 y no cambia el modelo. |
| Auth | **Clerk, app propia**, con opción de SSO contra la app de V&LIVING | Roles por `al_roles_usuario`, no por Clerk Organizations (multirol real). Clerk no se toca una vez configurado (decisión firme heredada). |
| Archivos | Vercel Blob (fotos, PDFs, documentos con hash) | Ya probado en vliving |
| Realtime / push | centrifuge + web-push VAPID (portados) | Ya en producción en vliving |
| Correo | Resend, dominio propio verificado | Respaldo duro de toda comunicación |
| Mensajería | Twilio (SMS, verificación) · WhatsApp por Composio/Twilio | Conserjería fuera de la app |
| Pagos | Stripe (REST, sin SDK) + Mercado Pago, **apagados** | Candado central hasta GO legal |
| Mapas | Mapbox (trayectos), Google Places (cerca) | Keys vivas |
| Conserje conversacional | mesh Cerebras + Gemini visión, mismo `nucleo` con vocabulario legal | Reusa `v-chat.js`; sin Mastra hasta que Luis decida (ver `docs/AMPERSAND-MANOS.md` de vliving) |
| PWA | manifest + `sw.js` real + háptico + `icono-pwa` | Instalable en iPhone: es donde el titular vive |
| Deploy | Vercel, push a `main` = producción, preview por PR, candado de escala en el build | Igual que vliving |
| QA | Playwright **WebKit** a 390×844 y 1440×1100 | Chrome da falsos verdes |

## 5. Qué se reutiliza, qué se porta, qué se escribe nuevo
- **Se consume por API (no se copia):** motor &, `/api/geo`, `/api/cerca`, `/api/lectura`, las 8 lecturas, mercados SHF. ALL LIVING no calcula inteligencia inmobiliaria.
- **Se porta con cambio de prefijo y TS:** `_auth.js`, `manos.js` + `manos-registro.js` + `CartaAccion`, `vliving-schema.js` (salas/adjuntos), `realtime-server.js`, `push-server.js`, `pago.js` + `stripe-webhook.js`, `docs.js`, `expediente-pdf.js`, `haptico.js`, `contenido.js`, `tokens.css` (movimiento y cristal, **no la paleta**), `verificar-escala.mjs`.
- **Se escribe nuevo (no existe en ningún repo):** calendario 294/70/1 con rotación e intercambios, estancias con disparadores, bandeja de conserjería con SLA, catálogo de beneficios por capas con canje y valor ahorrado, flotilla y app de chofer, checklists de unidad, cuotas y estado de cuenta, hitos de derechos, Sala de Cierre.

## 6. Marca y ley visual
No hay marca ALL LIVING todavía: ni logo, ni paleta, ni tipografía. **No se hereda el naranja `#F75602` ni el logo de V&LIVING por default**: son de otra casa con otra promesa. Se hereda la disciplina: un solo logo, un solo acento que jamás va sobre una cifra, cero colores fijos (tokens), un solo sistema de tarjeta, piso tipográfico 12 px con candado en el build, capturas en WebKit a resolución real antes de decir que algo se ve bien. Identidad se genera en F1 con `higgsfield-brandkit` + `paleta-luis` cuando Luis dé nombre y dirección.

## 7. Lo que la app dice y no dice (límite legal, no estilo)
Se aplica íntegro el vocabulario del Compendio v6 (`AGENTS.md`). En concreto para ALL LIVING: el calendario y las estancias existen solo para participaciones con hito documentado; una fracción con `interes` ve el calendario **de muestra**, marcado como tal, sin reservar. Ningún porcentaje de rendimiento en ninguna pantalla, ni en el estado de cuenta. La renta operativa se reporta como ocupación y tarifa medidas del pasado, nunca como expectativa.
