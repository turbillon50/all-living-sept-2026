import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, CalendarDots, MapPin, MusicNotes, Ticket, Sparkle, SoccerBall, MaskHappy, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getQuintanaRooEvents, parseFilters, type EventFilters, type TicketmasterEvent } from "@/lib/ticketmaster";
import { Mark } from "@/ui/mark";
import { EventsSearch, RetryCatalog } from "./search";
import { SiteFooter } from "@/ui/site-chrome";
import styles from "./events.module.css";

export const dynamic = "force-dynamic";
const cities = [
  { value: "cancun", label: "Cancún", image: "/demo/palms.webp", line: "Una ciudad en escena" },
  { value: "playa-del-carmen", label: "Playa del Carmen", image: "/demo/sunset.webp", line: "El ritmo de la Riviera" },
  { value: "tulum", label: "Tulum", image: "/demo/tulum-sea.webp", line: "Noches para recordar" },
 ] as const;
const categories = [
  { value: "all", label: "Todo", icon: Sparkle },
  { value: "Music", label: "Música", icon: MusicNotes },
  { value: "Sports", label: "Deportes", icon: SoccerBall },
  { value: "Arts & Theatre", label: "Arte y teatro", icon: MaskHappy },
 ] as const;
type Filters = EventFilters;
type EventsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function eventsUrl(filters: Partial<Filters>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && value !== "all") params.set(key, value); });
  return `/eventos${params.size ? `?${params}` : ""}#cartelera`;
}

function EventCard({ event }: { event: TicketmasterEvent }) {
  const date = new Date(`${event.date}T12:00:00-05:00`);
  const day = new Intl.DateTimeFormat("es-MX", { day: "2-digit", timeZone: "America/Cancun" }).format(date);
  const month = new Intl.DateTimeFormat("es-MX", { month: "short", timeZone: "America/Cancun" }).format(date).replace(".", "");
  const fullDate = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "America/Cancun" }).format(date);
  const price = event.price ? `${event.price.min !== event.price.max ? "Desde " : ""}${new Intl.NumberFormat("es-MX", { style: "currency", currency: event.price.currency, currencyDisplay: "code" }).format(event.price.min)}` : "Consulta el precio";
  return <article className={styles.eventCard}>
    <div className={styles.eventImage}>
      {event.imageUrl ? <Image src={event.imageUrl} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw" className={styles.coverImage} /> : <Ticket size={56} weight="duotone" aria-hidden />}
      <div className={styles.dateBadge}><strong>{day}</strong><span>{month}</span></div>
      {event.segment ? <span className={styles.segment}>{categories.find(category => category.value === event.segment)?.label ?? event.segment}</span> : null}
    </div>
    <div className={styles.eventBody}>
      <p className={styles.eventDate}>{fullDate}{event.time ? ` · ${event.time.slice(0, 5)}` : ""}</p>
      <h3>{event.title}</h3><p className={styles.venue}><MapPin size={15} aria-hidden />{event.venue} · {event.city}</p>
      <div className={styles.eventBottom}><span>{price}<small>en Ticketmaster</small></span><a href={event.ticketUrl} target="_blank" rel="sponsored noopener noreferrer" aria-label={`Ver boletos para ${event.title} en Ticketmaster`}>Ver boletos <ArrowUpRight size={17} aria-hidden /></a></div>
    </div>
  </article>;
}

function CatalogLoading() {
  return <div className={styles.catalogLoading} role="status" aria-label="Consultando la cartelera de Ticketmaster"><span className={styles.loadingLine} /><div className={styles.skeletonGrid}>{[0, 1, 2].map(i => <div className={styles.skeletonCard} key={i} />)}</div><p>Buscando tu próximo gran momento…</p></div>;
}

async function Catalog({ filters }: { filters: Filters }) {
  const places = await getQuintanaRooEvents(filters);
  const selectedPlaces = places.filter(place => filters.city === "all" || filters.city === place.place);
  const live = selectedPlaces.every(place => place.isLive);
  const filteredPlaces = selectedPlaces;
  const total = filteredPlaces.reduce((count, place) => count + place.events.length, 0);
  const hasFilters = Boolean(filters.q || filters.date || filters.category !== "all");
  const cityLabel = cities.find(city => city.value === filters.city)?.label ?? "Quintana Roo";
  return <>
    <div className={styles.catalogMeta}><p className={styles.liveStatus} data-live={live}><span />{live ? "Cartelera conectada a Ticketmaster" : "La cartelera no está disponible por ahora"}</p><p>{total > 0 ? `${total} ${total === 1 ? "evento" : "eventos"} · ${cityLabel}` : cityLabel}</p></div>
    {total ? filteredPlaces.filter(place => place.events.length).map(place => <section className={styles.placeSection} key={place.place} aria-labelledby={`place-${place.place}`}>
      <div className={styles.placeHeading}><h3 id={`place-${place.place}`}>{place.label}</h3><span>{place.events.length} {place.events.length === 1 ? "evento" : "eventos"}</span></div>
      <div className={styles.eventGrid}>{place.events.map(event => <EventCard key={event.id} event={event} />)}</div>{place.truncated ? <p className={styles.partialNotice}>Mostramos los próximos {place.events.length} eventos. Afina tu búsqueda por artista, fecha o categoría para encontrar más.</p> : null}
    </section>) : <div className={styles.emptyState} role="status">
      <div className={styles.emptyArt} aria-hidden><div className={styles.orbit} /><Ticket size={49} weight="duotone" /><span className={styles.spark}><Sparkle size={20} weight="fill" /></span></div>
      <div><p className={styles.kicker}>{live ? "Lo bueno también se hace esperar" : "Hagamos una pausa"}</p><h3>{!live ? "Estamos reconectando la cartelera." : hasFilters ? "Todavía no encontramos ese plan." : "La próxima gran noche está por anunciarse."}</h3><p>{!live ? "Ticketmaster no respondió a esta consulta. Inténtalo de nuevo en un momento." : hasFilters ? `No hay coincidencias${filters.q ? ` para “${filters.q}”` : ""} con estos filtros en ${cityLabel}. Prueba otra búsqueda.` : `Ticketmaster aún no publica próximos eventos en ${cityLabel}. En cuanto aparezcan, los encontrarás aquí.`}</p>
      {!live ? <RetryCatalog /> : hasFilters ? <Link href={eventsUrl({ city: filters.city })} className={styles.textLink}>Limpiar filtros <ArrowRight size={16} aria-hidden /></Link> : <span className={styles.updateNote}>Cartelera consultada en Ticketmaster</span>}</div>
    </div>}
    {!live && total > 0 ? <p className={styles.partialNotice}>Algunas plazas no respondieron. Los resultados pueden estar incompletos.</p> : null}
  </>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  return <div className={styles.site}>
    <a href="#cartelera" className={styles.skipLink}>Ir a la cartelera</a>
    <header className={styles.header}>
      <Link href="/eventos" className={styles.brand} aria-label="All Living Eventos, inicio"><Mark size={39} /><span><strong>All Living</strong><small>EVENTOS</small></span></Link>
      <nav aria-label="Navegación principal"><a href="#cartelera">Cartelera</a><a href="#ciudades">Por ciudad</a><a href="#como-funciona">Cómo funciona</a></nav>
      <Link href="/acceso" className={styles.headerCta}><Ticket size={18} weight="duotone" aria-hidden /> Abrir la app <ArrowUpRight size={16} aria-hidden /></Link>
    </header>
    <main>
      <section className={styles.hero} aria-labelledby="events-title">
        <Image src="/events/live-stage.webp" alt="Luces, confeti y público disfrutando un concierto" fill priority sizes="(max-width: 1280px) 100vw, 1240px" className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}><p className={styles.heroEyebrow}><span /> QUINTANA ROO · EN VIVO</p><h1 id="events-title">La vida suena<br />mejor <em>en vivo.</em></h1><p className={styles.lede}>Ese concierto. Ese partido. Esa noche.<br />Encuentra el próximo momento que vas a recordar.</p><a className={styles.heroLink} href="#cartelera">Descubre la cartelera <ArrowRight size={16} style={{ transform: "rotate(90deg)" }} aria-hidden /></a></div>
        <div className={styles.heroFoot}><span>Cancún <i /> Playa del Carmen <i /> Tulum</span><span className={styles.soundwave} aria-hidden>{[0, 1, 2, 3, 4, 5, 6].map(i => <b key={i} style={{ animationDelay: `${i * -0.17}s` }} />)}</span><small>MÚSICA · DEPORTE · ESCENA</small></div>
      </section>
      <div className={styles.searchWrap}><EventsSearch key={`${filters.q}-${filters.city}-${filters.date}-${filters.category}`} {...filters} /><div className={styles.searchCaption}><span><Ticket size={15} aria-hidden /> Tú eliges el momento. Tus boletos, en Ticketmaster.</span><span>Descubre · Elige · Vive</span></div></div>
      <section className={styles.cities} id="ciudades" aria-labelledby="cities-title"><div className={styles.sectionHeading}><div><p className={styles.kicker}>TRES CIUDADES, MIL FORMAS DE SENTIR</p><h2 id="cities-title">¿Dónde será tu próximo recuerdo?</h2></div><span className={styles.regionLabel}>Caribe mexicano <MapPin size={15} aria-hidden /></span></div>
        <div className={styles.cityGrid}>{cities.map(city => <Link key={city.value} href={eventsUrl({ ...filters, city: city.value })} className={styles.cityCard} aria-label={`Ver eventos en ${city.label}`} aria-current={filters.city === city.value ? "true" : undefined}><Image src={city.image} alt="" fill sizes="(max-width: 600px) 80vw, 33vw" className={styles.coverImage} /><span className={styles.cityShade} /><span className={styles.cityContent}><small>{city.line}</small><strong>{city.label}</strong></span><span className={styles.cityArrow}><ArrowUpRight size={19} aria-hidden /></span></Link>)}</div>
      </section>
      <section className={styles.catalog} id="cartelera" aria-labelledby="catalog-title"><div className={styles.sectionHeading}><div><p className={styles.kicker}>HAZLE ESPACIO A UN GRAN PLAN</p><h2 id="catalog-title">Tu próxima primera fila.</h2></div><nav className={styles.categories} aria-label="Tipo de evento">{categories.map(category => <Link key={category.value} href={eventsUrl({ ...filters, category: category.value })} aria-current={filters.category === category.value ? "true" : undefined}><category.icon size={18} weight="duotone" aria-hidden />{category.label}</Link>)}</nav></div>
        <Suspense key={JSON.stringify(filters)} fallback={<CatalogLoading />}><Catalog filters={filters} /></Suspense>
      </section>
      <section className={styles.howItWorks} id="como-funciona" aria-labelledby="how-title"><div className={styles.howIntro}><span className={styles.howIcon}><Ticket size={29} weight="duotone" aria-hidden /></span><p className={styles.kicker}>DEL “VAMOS” AL “AHÍ ESTUVIMOS”</p><h2 id="how-title">El plan empieza aquí.<br /><em>El recuerdo es tuyo.</em></h2><p>Descubre eventos en ALL LIVING y continúa tu compra directamente en Ticketmaster.</p></div><ol><li><span><MusicNotes size={21} weight="duotone" aria-hidden /></span><div><strong>Encuentra lo que te mueve</strong><p>Busca por ciudad, artista o tipo de evento.</p></div></li><li><span><CalendarDots size={21} weight="duotone" aria-hidden /></span><div><strong>Elige tu momento</strong><p>Revisa la fecha, el recinto y el precio publicado.</p></div></li><li><span><ArrowUpRight size={21} aria-hidden /></span><div><strong>Tus boletos, en Ticketmaster</strong><p>Abre la ficha oficial y completa ahí tu compra.</p></div></li></ol></section>
    </main>
    <SiteFooter />
  </div>;
}
