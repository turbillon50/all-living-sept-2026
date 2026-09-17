# All Living · Experiencias de consulta

Aplicación independiente para recorrer el catálogo real de Viator sin registro. Reutiliza la identidad visual aprobada de Eventos: Möbius, Fraunces/Inter, superficies claras, turquesa y navegación móvil. Las fotografías de portada son recursos existentes de All Living; las fotografías de producto vienen de Viator.

## Ejecutar

Node 20. `npm ci`, `npm test`, `npm run build`, `npm run start`.

Configurar únicamente `VIATOR_API_KEY` y `VIATOR_ENV=production|sandbox` en el proyecto de Vercel de esta aplicación. Root Directory: `apps/experiences-demo`. No incluir archivos fuera de la raíz. El modo production usa el catálogo real y no añade operaciones de reserva a la API.

## Alcance

- `/`: catálogo por país, región y ciudad, búsqueda de texto, fecha, moneda MXN/USD/EUR, presupuesto base, cancelación, orden y paginación.
- `/destinos`: taxonomía completa devuelta por Viator. Accesos a México, Argentina, Colombia, España, Caribe y Miami. Venezuela se identifica como pendiente porque no aparece en la taxonomía consultada.
- `/guardados`: selección local del navegador, sin cuenta; los importes y promesas de cancelación no se conservan como oferta vigente.
- Ficha modal: contenido real del producto, fotografías, inclusiones/exclusiones, información adicional y cancelaciones.
- `/informacion`: funcionamiento, contacto y tratamiento de datos de esta versión.
- Manifest, íconos y service worker propios. Offline muestra una explicación, nunca inventario en caché del navegador.

El adaptador sólo expone `/destinations`, `/products/search`, `/search/freetext` y `/products/{code}` del proveedor. Las claves sólo se usan en servidor. Los enlaces conservan atribución Viator. El acceso básico disponible termina la compra y pago en Viator. La solicitud de Full + Booking sigue en revisión.

La colección curada de All Living está indicada como preparación; no se inventan productos. Los precios desde incluyen los cargos en destino informados. El filtro y orden por precio usan el precio base del proveedor y se explica esa diferencia. Los errores y respuestas inválidas no se transforman en estados vacíos.

Consultas de productos y fichas: caché de servidor de cinco minutos. Taxonomía: un día. Timeout: 18 segundos. Un 429 pausa nuevas consultas durante un minuto en la instancia. Las páginas y API llevan noindex para evitar indexar opiniones del proveedor y esta versión de consulta.

## Validación

12 pruebas de normalización, atribución, precios, fechas, filtros internacionales, estados vacíos reales, fallos y límites. Build y TypeScript con Node 20. La revisión visual y las pruebas HTTP del despliegue se registran en el relevo de entrega.

Esta aplicación no importa módulos de otras aplicaciones del repositorio. Tiene package.json y lockfile propios. Publicar esta aplicación no cambia los dominios productivos existentes.

Fuentes: https://docs.viator.com/partner-api/technical/ y https://partnerresources.viator.com/travel-commerce/affiliate/basic-access/golden-path/.
