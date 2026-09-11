import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/domains/identity/current-user";
import { propertyById } from "@/domains/properties/queries";
import { fractionCore, weeksForOwner } from "@/domains/fractions/local-fraction-core";
import { nextStayFor } from "@/domains/stays/queries";
import { maps } from "@/integrations/maps";
import { formatRange } from "@/core/format";
import { SEASON_LABEL, WEEK_STATUS } from "@/domains/fractions/labels";
import { Page, Section } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Photo } from "@/ui/photo";
import { Chip } from "@/ui/chip";
import { ButtonLink } from "@/ui/button";

export const dynamic = "force-dynamic";

/** Pantalla 13: detalle de propiedad. Experiencia primero; lo contractual, aparte y discreto. */
export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const property = await propertyById(id);
  if (!property) notFound();
  const ownerships = (await fractionCore().getUserOwnerships(user.id)).filter((o) => o.propertyId === property.id);
  const isOwner = ownerships.length > 0;
  const [weeks, next] = await Promise.all([isOwner ? weeksForOwner(user.id) : Promise.resolve([]), nextStayFor(user.id)]);
  const myWeeks = weeks.filter((w) => w.propertyId === property.id);
  const cover = property.media.find((m) => m.isCover) ?? property.media[0];
  const rest = property.media.filter((m) => m.id !== cover?.id).slice(0, 4);
  const mapUrl = property.lat && property.lng ? maps().staticMapUrl(Number(property.lat), Number(property.lng)) : null;

  return (
    <Page wide>
      <TopBar back={isOwner ? "/properties" : "/explore"} title={property.name} />
      {cover ? <Photo src={cover.url} alt={cover.alt} priority sizes="(max-width: 768px) 100vw, 1152px" ratio="4/3" className="mt-2 md:hidden" /> : null}
      <div className="hidden md:grid md:grid-cols-3 md:gap-3 mt-2">
        {cover ? <Photo src={cover.url} alt={cover.alt} priority sizes="66vw" ratio="3/2" className="col-span-2" /> : null}
        <div className="grid grid-rows-2 gap-3">
          {rest.slice(0, 2).map((m) => <Photo key={m.id} src={m.url} alt={m.alt} sizes="33vw" ratio="3/2" />)}
        </div>
      </div>
      {rest.length > 0 ? (
        <ul className="no-scrollbar mt-3 -mx-5 flex gap-2 overflow-x-auto px-5 md:hidden">
          {rest.map((m) => <li key={m.id} className="w-28 shrink-0"><Photo src={m.url} alt={m.alt} sizes="112px" ratio="1/1" /></li>)}
        </ul>
      ) : null}

      <header className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[1.06] md:text-[40px]">{property.name}</h1>
          <p className="mt-1 text-text-2">{property.destination} · {property.city}{property.bedrooms ? ` · ${property.bedrooms} recámaras` : ""}{property.maxGuests ? ` · hasta ${property.maxGuests} personas` : ""}</p>
        </div>
        {property.isDemo ? <Chip>Demo</Chip> : null}
      </header>
      {property.description ? <p className="mt-4 max-w-prose text-[16px] leading-relaxed">{property.description}</p> : null}

      {isOwner ? (
        <Section title="Mis fracciones">
          <ul className="flex flex-wrap gap-2">
            {ownerships.map((o) => (
              <li key={o.id}><Link href={`/fractions/${o.fractionId}`} className="press inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-accent-soft px-4 text-sm font-medium text-green-900">Fracción {o.fractionCode}</Link></li>
            ))}
          </ul>
        </Section>
      ) : null}

      {next && next.propertyId === property.id ? (
        <Section title="Próxima estancia">
          <Link href={`/stays/${next.id}`} className="press flex items-center justify-between rounded-[var(--radius-card)] bg-surface hairline p-4">
            <span><span className="block font-medium">{formatRange(next.startDate, next.endDate)}</span><span className="block text-sm text-text-2">{next.guestsCount} personas</span></span>
            <Chip tone="accent">{next.status === "in_progress" ? "En curso" : "Próxima"}</Chip>
          </Link>
        </Section>
      ) : null}

      {isOwner && myWeeks.length > 0 ? (
        <Section title="Mis semanas" action={<Link href="/weeks" className="text-sm text-green-900">Ver todas</Link>}>
          <ul className="grid gap-2.5 md:grid-cols-3">
            {myWeeks.map(({ week }) => (
              <li key={week.id}>
                <Link href={`/weeks/${week.id}`} className="press block rounded-[var(--radius-card)] bg-surface hairline p-4">
                  <p className="font-serif text-[20px]">{formatRange(week.startDate, week.endDate)}</p>
                  <p className="mt-1 text-sm text-text-2">Semana {SEASON_LABEL[week.season]}</p>
                  <Chip tone={WEEK_STATUS[week.status].tone} className="mt-2">{WEEK_STATUS[week.status].label}</Chip>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Amenidades">
        <ul className="flex flex-wrap gap-2">{property.amenities.map((a) => <li key={a}><Chip>{a}</Chip></li>)}</ul>
      </Section>

      <Section title="Ubicación">
        {mapUrl ? <Photo src={mapUrl} alt={`Mapa de ${property.name}`} ratio="16/9" sizes="(max-width: 768px) 100vw, 672px" /> : (
          <div className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm text-text-2">
            {property.destination}, {property.city}. La dirección exacta se comparte con la estancia confirmada.
            {property.lat && property.lng ? <a className="ml-2 text-green-900 underline underline-offset-4" href={maps().directionsUrl(Number(property.lat), Number(property.lng))} target="_blank" rel="noreferrer">Abrir en mapas</a> : null}
          </div>
        )}
      </Section>

      {property.rules.length > 0 ? (
        <Section title="Reglas de la casa">
          <ul className="list-disc pl-5 text-sm text-text-2 space-y-1">{property.rules.map((r) => <li key={r}>{r}</li>)}</ul>
        </Section>
      ) : null}

      {isOwner ? (
        <Section title="Documentación">
          <div className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm text-text-2">Contratos, reglamento y documentos autorizados de tu fracción. <Link href={`/fractions/${ownerships[0]?.fractionId}`} className="text-green-900 underline underline-offset-4">Ver en la fracción</Link></div>
        </Section>
      ) : null}

      {!isOwner ? (
        <div className="mt-10"><ButtonLink href="/services" variant="secondary">Ver servicios en {property.destination}</ButtonLink></div>
      ) : null}
    </Page>
  );
}
