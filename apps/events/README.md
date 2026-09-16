# ALL LIVING Eventos

Aplicación independiente para `events.alliving.live`. Esta carpeta se puede copiar fuera del repositorio, instalar y compilar sin el proyecto principal.

## Ejecutar

Node 20. `npm ci`, `npm test`, `npm run build` y `npm start`.
Para desarrollo: `npm run dev`. La única variable propia del proyecto es `TICKETMASTER_API_KEY` (servidor). Usar `.env.local` únicamente fuera de Git; la llave no debe imprimirse ni enviarse al navegador.

## Aislamiento permanente

- Paquete, lockfile, dependencias, tipografías compiladas, íconos, imágenes, estilos, service worker y despliegue propios.
- Sin imports fuera de esta carpeta, symlinks al padre, Clerk, autenticación del padre, Neon ni otra base de datos.
- Vercel: proyecto `all-living-events`, raíz `apps/events`, Node `20.x`, `sourceFilesOutsideRootDirectory: false`; `npm ci --no-audit --no-fund` y `npm run build`.
- La navegación y la búsqueda nunca requieren cuenta. Este subdominio es exclusivamente de eventos: no agregar otros servicios, paquetes, precios combinados o carrito compartido.
- Los enlaces de boletos sólo llevan a dominios oficiales de Ticketmaster. El checkout local es exclusivamente una simulación, claramente identificada, sin datos bancarios ni llamadas de pago. No hay seguimiento de afiliados.
- Publicación directa a producción por instrucción de Luis; previews desactivados. No ejecutar ninguna verificación de Impact sin su reauditoría.

## Discovery API

`GET /api/events?q=&city=cancun|playa-del-carmen|tulum&date=YYYY-MM-DD&category=Music|Sports|Arts%20%26%20Theatre`.

La página renderiza en servidor usando el mismo proveedor. El texto, fecha y categoría se envían a Discovery. Se fuerza México y fuente Ticketmaster. Se buscan coordenadas por plaza y, si la respuesta válida está vacía, variantes de ciudad (incluye Solidaridad). No se rellena la cartelera con datos ficticios o eventos de otras regiones.

Respuestas válidas vacías: HTTP 200, `ok: true`, `isLive: true`. Fallos, respuesta inválida, credencial ausente o cuota: HTTP 503, `ok: false`, `isLive: false`, mensaje visible. Las respuestas de error no se cachean en el endpoint público.

Las consultas se serializan con separación mínima de 275 ms por proceso. El caché de datos de Next dura 15 minutos para la cartelera y 60 segundos para búsquedas; se estabilizan las fechas de consulta para aprovecharlo. Se respeta la pausa de HTTP 429 / Retry-After / Rate-Limit-Reset. La cuota del proveedor es 5,000/día y 5/segundo por llave; la cola en memoria no es un limitador global entre instancias y otros consumidores de la misma llave. Revisar cuota real en Ticketmaster si aumenta el tráfico. Cada plaza muestra hasta 200 próximos resultados y pide afinar filtros si hay más.

## PWA y privacidad

Manifest con nombre, identidad, íconos 192/512/maskable, inicio `/app` (conserva la identidad `id: /eventos` para instalaciones existentes), alcance `/` y display standalone. El service worker sólo precachea recursos básicos y la pantalla sin conexión; nunca almacena búsquedas, respuestas de API ni inventario. No analytics, autenticación real ni cookies de identificación propias. Perfil y sesión de demo en almacenamiento local aislado. La instalación depende del navegador y sus condiciones de elegibilidad.

Páginas `/privacidad`, `/terminos`, `/responsable`, enlazadas desde el footer. Responsable proporcionado por Luis: Colectivo Mass S.A. de C.V., `luisdelator@vmomentums.info`.

**Domicilio fiscal incorporado:** Avenida Paseo de la Reforma 389, piso 19, colonia Juárez, alcaldía Cuauhtémoc, C.P. 06600, Ciudad de México, México. Fuente: constancia de situación fiscal de Colectivo Mass expedida el 27 de septiembre de 2021, proporcionada por Luis el 16 de septiembre de 2026 en los adjuntos `fiscal.jpg` y `situacionfiscal.jpg`. Transcripción contrastada con el documento, sin consulta de vigencia ante el SAT. El domicilio está en `/privacidad` y `/responsable`. No se publica la constancia, su QR, identificadores ni contactos distintos del correo autorizado. Se cierra el pendiente documental señalado en la entrega inicial; la reauditoría de Luis y cualquier aprobación de Impact/Ticketmaster siguen siendo pasos separados.

## Evidencia inicial del 16 de septiembre de 2026

- Compilación y seis pruebas con Node 20; segunda instalación y compilación copiando sólo esta carpeta a `/tmp`, sin dependencias del padre.
- Discovery real: seis consultas geográficas/ciudad, HTTP 200 y cero resultados para las tres plazas. Diagnóstico separado a México: HTTP 200, 2,732 eventos. Ese inventario nacional no se publica en esta aplicación.
- La copia aislada no tiene dependencias Clerk, Neon o Drizzle. El proyecto Vercel sólo tiene la variable de Discovery.
- Verificar dominio, manifest, búsqueda, páginas legales y scripts de red después de cada publicación.

Fuentes oficiales: [Discovery](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/), [términos API](https://developer.ticketmaster.com/support/terms-of-use/), [LFPDPPP](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf).

## Interior de la app y demo independiente

La portada `/eventos` se conserva; su botón “Abrir la app” lleva a `/acceso`. El acceso demo permite un apodo y no solicita contraseña, OAuth ni credenciales de la aplicación principal. **No es autenticación real:** no tiene servidor de identidades, sesiones seguras, recuperación de cuentas ni sincronización. Descubrir eventos permanece libre.

Rutas: `/app`, `/app/mapa`, `/app/evento/[id]`, `/app/musica`, `/app/guardados`, `/app/carrito`, `/app/pago`, `/app/planes`, `/app/perfil`, `/app/ajustes`. Navegación móvil con cinco pestañas, menú lateral, actividad de la sesión y acceso de instalación.

- Demo: seis fichas de muestra con artistas/fechas/recintos/precios explícitamente ficticios. No son anuncios de artistas, disponibilidad ni inventario. Carrito sólo acepta IDs y fechas de la demo, zonas permitidas y cantidades de 1–6.
- Pago: métodos de prueba precargados, sin PAN/CVV/CLABE ni transmisión financiera. Confirmación `DEMO-…`, sin validez de acceso. Fechas descargables ICS marcadas DEMO, sin presentación confirmada.
- Real: el selector de cartelera usa `/api/events` con los filtros enviados a Ticketmaster. No mezcla fichas de muestra. La compra real sigue exclusivamente por el enlace oficial.
- Preferencias locales versionadas en `all-living-events-demo-v1`, validadas al restaurar; exportables/borrables en Ajustes. No se hereda almacenamiento de All Living.
- Música: reproductor oficial de Spotify sólo después de pulsar escuchar. IDs de Jungle, RÜFÜS DU SOL y Mon Laferte comprobados con oEmbed oficial; sin OAuth ni nuevas variables.
- Mapa: Leaflet se importa al abrirlo. OpenStreetMap carga mapas sólo tras la acción del visitante, con atribución, Referer normal y sin precache ni descarga masiva. Los pines demo son ilustrativos. La cartelera real usa coordenadas publicadas.
- PWA: instalación desde menú/Ajustes; si no hay prompt nativo, instrucciones específicas de navegador. El service worker no conserva API, mapas ni reproductores.

Fuentes de implementación: [Spotify Embeds](https://developer.spotify.com/documentation/embeds), [Leaflet](https://leafletjs.com/reference.html), [política de mapas OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).

Validación del interior: compilación de producción con Node 20 y 11 pruebas aprobadas (contrato Discovery, coordenadas/Spotify, límites del carrito, separación de inventario real y confirmación simulada). Las pruebas de interfaz y producción se registran al terminar el despliegue.
