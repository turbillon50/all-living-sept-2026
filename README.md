# ALL LIVING — sept 2026

**Qué es.** La capa de operación de la vida fraccional: lo que pasa *después* de que alguien toma una participación en una propiedad. Titulares, calendario de semanas, estancias, conserjería 24/7, flotilla, beneficios, administración de la unidad, expediente legal y estado de cuenta. En palabras de Luis (14-ago-2026, memoria 3344 del Brain): *"algo entre Airbnb y hoteles de superlujo, con servicios gratuitos que te hacen ahorrar dinero cotidianamente"*.

**Qué NO es.** No es V&LIVING. V&LIVING (`vliving-2026`, vliving.site) es la inteligencia y el mercado: lee la propiedad, arma el expediente, vende la fracción. ALL LIVING recibe al titular cuando ya firmó y opera su vida en la propiedad. Comparten inventario (ATTIK, Case 001), marco legal y doctrina; no comparten pantallas.

> **Supuesto declarado.** El repo nació vacío con un solo commit y un README de una línea. La definición de arriba sale del Brain (memorias 3344, 3339, 3635, 3644) y de lo que ya vive en `vliving-2026`, no de un brief escrito por Luis para este repo. Si el alcance es otro, se corrige el blueprint antes de escribir código. Es la decisión número 1 de `docs/03-plan-arranque.md`.

## Estado

| Fase (VForge Method) | Estado | Evidencia |
|---|---|---|
| F0 Discovery — blueprint + README maestro + arquitectura | **Hecha en este PR** | `docs/01`, `docs/02`, `docs/03` |
| F1 Diseño navegable | Pendiente | Falta marca ALL LIVING (nombre, logo, paleta) |
| F2 Repo + Vercel | Pendiente | Repo existe; sin proyecto Vercel |
| F3 Infra (Neon, Clerk, Resend, DNS) | Pendiente | Ver dominios en `docs/01` |
| F4–F8 | Pendiente | — |

**Fecha que manda:** ATTIK se entrega **diciembre 2026** (prospecto oficial). Ese día tiene que existir la conserjería, el calendario y el estado de cuenta del titular. Son 12 semanas.

## Índice

- `docs/01-inventario-recursos.md` — todo lo que ya tenemos y sirve, medido el 09-sep-2026: repos, motores, tablas, credenciales, skills, infra, legal.
- `docs/02-blueprint.md` — qué se construye: roles, módulos, modelo de datos, stack, qué se reutiliza y qué se escribe nuevo.
- `docs/03-plan-arranque.md` — fases con compuertas, decisiones que solo Luis puede tomar, riesgos.
- `AGENTS.md` — reglas para cualquier agente que toque este repo. Se lee completo antes de escribir código.

## Cómo se trabaja aquí (resumen)

- Cada agente en su worktree. Node 20. Commits firmados `turbillon50 <turbillon50@gmail.com>` o Vercel bloquea el preview.
- Nada de datos de negocio en el código: viven en Neon, en el proyecto propio de ALL LIVING (no en el Brain).
- Vocabulario legal del Compendio Maestro Fractional v6: es límite legal, no estilo. Está en `AGENTS.md`.
- "Ya quedó" sin build verde y captura en WebKit no existe.
