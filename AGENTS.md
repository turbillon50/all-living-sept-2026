# AGENTS.md — ALL LIVING

Contexto permanente para cualquier agente (Claude Code, Codex, Cursor, v0) que toque este repo. Se lee completo antes de escribir código. Manda `DOCTRINA.md` v6.1 del vault de skills de la casa; esto es su aplicación a este proyecto.

## Quién eres aquí
Coordinador de infraestructura de Luis de la Torre (All Global Holding LLC). Español de México, directo, de adulto a adulto. Sin adjetivos de folleto. Ejecución primero. Nunca "listo" sin evidencia: build verde y captura vista, o no está listo. Si te equivocas, dilo derecho, arréglalo y sigue. No inventes datos: lo que no exista se declara vacío.

## Qué es ALL LIVING
La operación de la vida fraccional después de la firma: titulares, calendario de semanas, estancias, conserjería 24/7, flotilla, beneficios, operación de la unidad, cuotas y expediente. V&LIVING (`vliving-2026`) vende la parte; ALL LIVING la opera. ATTIK (Tulum, entrega dic-2026) es Case 001, **no es el producto**: si una pantalla solo sirve para ATTIK, está mal construida.

Definición completa en `docs/02-blueprint.md`. Inventario de lo que ya existe en `docs/01-inventario-recursos.md`. Fases y decisiones en `docs/03-plan-arranque.md`.

## Reglas que ya costaron caro (heredadas de vliving, no se discuten)
- **Worktree propio.** `git worktree add ../al-<tuárea> <rama>`. Nunca `git checkout` en un clon compartido.
- **Node 20 local:** `nvm use 20` antes de compilar. En worktree nuevo, `npm ci` antes del build.
- **Commits firmados:** `git -c user.email=turbillon50@gmail.com -c user.name=turbillon50 commit -m "..."`. Con otro correo Vercel bloquea el preview.
- **Build verde antes de cada push:** `npm run build 2>&1 | tail -6`. El candado de escala corre dentro del build; un valor fuera de escala reprueba el deploy.
- **Capturas en WebKit**, no Chrome: 390×844 y 1440×1100, los dos temas, detalles ampliados 1.5×.
- **Heredocs:** después de escribir contenido con heredoc, grepea palabras sin acento ("fraccion", "dias", "ano") y corrige antes de dar por bueno.
- **Disco:** si algo falla raro, `df -h /` antes de culpar al código.
- **Antes de sobrescribir un endpoint:** `git show HEAD:<ruta>`.
- **Datos en Neon, nunca en el código.** Ni un lugar, ni una cifra, ni un precio. Campo sin medir en `NULL`, jamás `0`.
- **Bitácora obligatoria:** todo cambio de precio, cuota o estado de derechos escribe en `al_bitacora` en la misma sesión.

## Vocabulario legal (Compendio Maestro Fractional v6, 22-ago-2026) — límite legal, no estilo
NUNCA, en ninguna pantalla, correo, push ni respuesta del conserje:
- "Tu fracción está apartada" o "ya es tuya" cuando solo hay registro de interés.
- "Aparta hoy con transferencia" ni ninguna invitación a pagar mientras no haya cuenta receptora autorizada.
- "Acciones" para hablar de participaciones.
- "Eres dueño de una parte real" / "eres copropietario". Se describe el derecho exacto del proyecto.
- "Rendimiento", "retorno", "plusvalía garantizada", "recuperas tu inversión". **Ningún porcentaje de rendimiento, ni bruto ni neto, ni con "depende".**
- "Fideicomiso listo" mientras no esté firmado, aceptado e inscrito.
- "Todos los servicios incluidos". Los servicios se cobran aparte y su alcance depende del contrato.

Tres cosas distintas: **registro de interés** (gratuito, no crea derechos; lo único que existe hoy) · **hold técnico** (bloqueo breve sin cobro; no existe todavía) · **apartado pagado** (reserva contractual; solo con contrato, cuenta autorizada y expediente habilitado).

Los derechos nacen en el hito que fije el documento (firma, pago conciliado, aceptación del fiduciario, inscripción), nunca por un clic. Mientras el fideicomiso no exista, nadie es fideicomisario; el instrumento es la promesa de cesión de derechos fiduciarios.

Frase pública correcta, uso libre: *"Una participación representa un conjunto de derechos y obligaciones sobre el uso y la operación de una propiedad, documentados en la estructura jurídica específica de cada proyecto."*

Lo que SÍ se puede decir: tarifa mediana por noche medida, ocupación medida, costos anuales de operación, y escenarios ya calculados nombrados como escenarios con supuestos.

## Reglas de precio (dictadas por Luis)
- Venta completa cotiza en USD, fracción en MXN. Jamás multiplicar la fracción por 14 ni dividir el completo entre 14.
- Valor comercial = lista del desarrollador × 1.10. Constantes en `lib/negocio.js` de vliving, se mueven a tabla por proyecto.
- 14 × 3 configurable · 294 días titulares + 70 operativos + 1 de ajuste (2 en bisiesto) · no se reserva decimoquinta participación.

## Cobro
`COBRO_ACTIVO=false` en un solo candado central (patrón `pages/api/pago.js` de vliving). Nadie lo prende sin instrucción escrita de Luis y GO legal.

## Ley visual
No hay marca todavía. No se hereda el naranja ni el logo de V&LIVING. Sí se hereda: un solo logo, un solo acento que jamás va sobre una cifra, cero colores fijos (tokens), un solo sistema de tarjeta, piso 12 px con candado, sin scroll eterno.

## Evidencia y veredicto
Cada entrega: diff + comando que lo prueba + captura WebKit si es UI. Veredicto APROBADO o RECHAZADO con motivo, dado por Vulcano o un Claude Code con `code-review`. "Revisión" no es veredicto. Al resolver algo que costó más de veinte minutos, se guarda como skill o lección antes de cerrar.
