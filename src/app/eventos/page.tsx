import Image from "next/image";
import Link from "next/link";
import { getQuintanaRooEvents, type TicketmasterEvent } from "@/integrations/ticketmaster/events";
import styles from "./events.module.css";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Cancun",
});

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Cancun",
});

function formatDate(date: string, time: string | null) {
  const instant = new Date(`${date}T${time ?? "12:00:00"}-05:00`);
  const formattedDate = dateFormatter.format(instant);
  return time ? `${formattedDate} · ${timeFormatter.format(instant)}` : formattedDate;
}

function formatPrice(event: TicketmasterEvent) {
  if (!event.price) return "Precio disponible en Ticketmaster";

  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: event.price.currency,
    maximumFractionDigits: 0,
  });

  if (event.price.min === event.price.max) return formatter.format(event.price.min);
  return `Desde ${formatter.format(event.price.min)}`;
}

function EventCard({ event }: { event: TicketmasterEvent }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageFrame}>
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt=""
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">AL</div>
        )}
        {event.segment ? <span className={styles.segment}>{event.segment}</span> : null}
      </div>
      <div className={styles.cardBody}>
        <p className={styles.date}>{formatDate(event.date, event.time)}</p>
        <h3>{event.title}</h3>
        <p className={styles.venue}>{event.venue} · {event.city}</p>
        <div className={styles.cardFooter}>
          <span className={styles.price}>{formatPrice(event)}</span>
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className={styles.buyButton}
            aria-label={`Comprar boletos para ${event.title} en Ticketmaster`}
          >
            Comprar boletos <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { q = "" } = await searchParams;
  const safeQuery = q.slice(0, 80).trim();
  const places = await getQuintanaRooEvents(safeQuery);
  const totalEvents = places.reduce((total, place) => total + place.events.length, 0);
  const connectionLive = places.every((place) => place.isLive);

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="All Living Eventos, inicio">
          <span className={styles.brandMark} aria-hidden="true">AL</span>
          <span><strong>ALL LIVING</strong><small>EVENTOS</small></span>
        </Link>
        <nav aria-label="Navegación principal">
          <a href="#cartelera">Cartelera</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="https://alliving.live" target="_blank" rel="noopener noreferrer">Explora más ↗</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Cancún · Playa del Carmen · Tulum</p>
          <h1>Encuentra tu próximo evento en Quintana Roo.</h1>
          <p className={styles.lede}>Consulta la cartelera real y continúa tu compra directamente en Ticketmaster.</p>
        </div>

        <form className={styles.search} action="/" method="get" role="search">
          <label htmlFor="event-search">Buscar artista, deporte o espectáculo</label>
          <div>
            <input
              id="event-search"
              name="q"
              defaultValue={safeQuery}
              maxLength={80}
              placeholder="Ej. concierto, comedia, fútbol"
              autoComplete="off"
            />
            <button type="submit">Buscar</button>
          </div>
        </form>

        <div className={styles.liveStatus} data-live={connectionLive}>
          <span aria-hidden="true" />
          {connectionLive ? "Consulta en vivo · Ticketmaster Discovery API" : "Conexión temporalmente no disponible"}
        </div>
      </section>

      <section className={styles.catalog} id="cartelera" aria-labelledby="catalog-title">
        <div className={styles.catalogHeading}>
          <div>
            <p className={styles.kicker}>Cartelera local</p>
            <h2 id="catalog-title">Eventos por plaza</h2>
          </div>
          <p>{safeQuery ? `${totalEvents} resultados para “${safeQuery}”` : `${totalEvents} eventos publicados ahora`}</p>
        </div>

        {places.map((place) => (
          <section className={styles.placeSection} key={place.place} aria-labelledby={`place-${place.place}`}>
            <div className={styles.placeHeading}>
              <h2 id={`place-${place.place}`}>{place.label}</h2>
              <span>{place.events.length} {place.events.length === 1 ? "evento" : "eventos"}</span>
            </div>

            {place.error ? (
              <div className={styles.emptyState} role="status">
                <strong>No pudimos cargar esta plaza.</strong>
                <p>{place.error}</p>
              </div>
            ) : place.events.length ? (
              <div className={styles.grid}>
                {place.events.map((event) => <EventCard event={event} key={event.id} />)}
              </div>
            ) : (
              <div className={styles.emptyState} role="status">
                <strong>Sin eventos publicados por Ticketmaster por ahora.</strong>
                <p>La cartelera se actualiza automáticamente cuando aparece nuevo inventario para {place.label}.</p>
              </div>
            )}
          </section>
        ))}
      </section>

      <section className={styles.howItWorks} id="como-funciona" aria-labelledby="how-title">
        <div>
          <p className={styles.kicker}>Compra transparente</p>
          <h2 id="how-title">Tú eliges aquí. Ticketmaster completa la compra.</h2>
        </div>
        <ol>
          <li><span>01</span><strong>Descubre</strong><p>Explora eventos reales disponibles en las tres plazas.</p></li>
          <li><span>02</span><strong>Elige</strong><p>Revisa fecha, venue y precio cuando el organizador lo publica.</p></li>
          <li><span>03</span><strong>Compra</strong><p>El botón abre la ficha oficial de Ticketmaster en una pestaña nueva.</p></li>
        </ol>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>ALL LIVING EVENTOS</strong>
          <p>Descubrimiento de eventos en Quintana Roo.</p>
        </div>
        <p>All Living no procesa pagos ni emite boletos. Disponibilidad, precios y compra final dependen de Ticketmaster y del organizador.</p>
        <a href="https://alliving.live" target="_blank" rel="noopener noreferrer">alliving.live ↗</a>
      </footer>
    </main>
  );
}
