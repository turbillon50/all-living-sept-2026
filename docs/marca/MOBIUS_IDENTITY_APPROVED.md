# ALL LIVING — Identidad Möbius aprobada

Dirección visual aprobada por Luis el 11-sep-2026.

## Decisión
- Eliminar la identidad arbitraria anterior “La Palma” y sus hojas/sol bronce.
- Sustituirla por un símbolo maestro inspirado en una banda de Möbius: una superficie continua, suave, abstracta y propietaria.
- No usar un aro simple como logo. El concepto anterior del aro queda absorbido por el Möbius y sus estados de movimiento.
- Paleta: Caribbean Turquoise → Ocean Blue → Aqua Light → Sand/Ivory → White. Evitar verde pantano, oliva, dorado y bronce.
- El símbolo debe funcionar en app icon, PWA/favicon, splash, header, loader, Living Pass, Verified y watermark.

## Motion
El símbolo está vivo de manera permanente, pero nunca parece spinner ni “árbol de Navidad”. En superficies que admiten motion, gira/deforma sutilmente en 3D con una vuelta muy lenta (~18–30 s), easing continuo y amplitud mínima. En hover/pointer puede responder apenas con parallax/tilt. En momentos de carga puede aumentar temporalmente el recorrido y después volver a idle. `prefers-reduced-motion` deja una pose estática elegante.

## Underwater / immersive states
La dirección visual aprobada incluye momentos inmersivos bajo el agua: superficie oceánica viva, refracción/caustics muy sutiles, profundidad y movimiento lento. Deben ser interactivos cuando aporte (pointer/parallax) y performant; nunca video pesado obligatorio ni efectos que compitan con contenido.

## Craft
Calidad Craft UI: microinteracciones 120–350 ms para controles, transiciones naturales, safe areas, skeletons, cero flash blanco, responsive 390/430/768/1440, contraste y reduced motion. El lujo viene de proporción, fotografía, tipografía, materiales visuales y movimiento, no de adornos.

## Regla de implementación
Preservar Clerk, Neon, Fraction Core, rutas y lógica existente. La identidad es un sistema transversal; reemplazar assets/componentes anteriores sin romper producto. Primero branch/preview + build/typecheck/lint/tests; producción sólo después de validación.