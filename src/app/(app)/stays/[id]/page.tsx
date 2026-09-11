import { notFound } from "next/navigation";
import Link from "next/link";
import { KeyRound, Users, Sparkles, LifeBuoy, Info, Car, ShoppingBasket, ChefHat, Baby, PartyPopper, CalendarCheck } from "@/ui/icons";
import { requireUser } from "@/domains/identity/current-user";
import { stayById } from "@/domains/stays/queries";
import { checkIn, checkOut } from "@/domains/stays/actions";
import { daysUntil, formatRange, formatLongDate } from "@/core/format";
import { Timeline } from "@/domains/stays/timeline";
import { Page, Section } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { Button, ButtonLink } from "@/ui/button";
import { EmptyState } from "@/ui/empty-state";
import { HeroHeader, IconAction, ListRow, RowGroup } from "@/ui/primitives";

export const dynamic = "force-dynamic";

/** Pantallas 22 y 24: detalle de estancia · modo "estoy aquí". Hero, cuatro acciones en círculo, prepara tu estancia. */
export default async function StayDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const stay = await stayById(id);
  if (!stay) notFound();
  const me = stay.guests.find((g) => g.userId === user.id);
  const isHost = stay.hostUserId === user.id;
  if (!isHost && !(me && me.status === "accepted") && !user.roles.includes("operator") && !user.roles.includes("admin")) notFound();
  const canBook = isHost || Boolean(me?.permissions?.can_book_services);
  const inStay = stay.status === "in_progress";
  const cover = stay.property.media.find((m) => m.isCover) ?? stay.property.media[0];
  const days = daysUntil(stay.startDate);
  const eyebrow = inStay ? "En curso" : stay.status === "completed" ? "Terminada" : stay.status === "cancelled" ? "Cancelada" : days === 0 ? "Hoy" : days === 1 ? "Mañana" : `En ${days} días`;
  const prep = (stay.preparation ?? {}) as Record<string, unknown>;
  const timeline = stay.bookings.map((b) => ({ id: b.booking.id, at: b.booking.scheduledAt, title: b.serviceName, subtitle: b.providerName, status: b.booking.status, href: `/bookings/${b.booking.id}` }));
  const actions = inStay
    ? [{ href: `/stays/${stay.id}/access`, label: "Check-in", Icon: CalendarCheck }, { href: `/services?stay=${stay.id}`, label: "Servicios", Icon: Sparkles }, { href: `/stays/${stay.id}/guests`, label: "Invitados", Icon: Users }, { href: `/support?stay=${stay.id}`, label: "Soporte", Icon: LifeBuoy }]
    : [{ href: `/properties/${stay.property.id}`, label: "Detalles", Icon: Info }, { href: `/stays/${stay.id}/guests`, label: "Huéspedes", Icon: Users }, { href: `/services?stay=${stay.id}`, label: "Servicios", Icon: Sparkles }, { href: `/stays/${stay.id}/access`, label: "Acceso", Icon: KeyRound }];
  const prepRows = [
    { Icon: Car, title: "Transporte aeropuerto", sub: prep.pickup ? "Te recogemos" : "¿Te recogemos?" },
    { Icon: ShoppingBasket, title: "Supermercado", sub: prep.grocery ? "Tu refrigerador listo" : "¿Refrigerador listo al llegar?" },
    { Icon: ChefHat, title: "Chef privado", sub: prep.chef ? "Cena especial en casa" : "¿Cena especial la primera noche?" },
    { Icon: Baby, title: "Cuna y niñera", sub: prep.crib || prep.nanny ? [prep.crib ? "Cuna" : null, prep.nanny ? "Niñera" : null].filter(Boolean).join(" · ") : "Si viajas con peques" },
    { Icon: PartyPopper, title: "Celebración", sub: typeof prep.celebration === "string" && prep.celebration ? prep.celebration : "¿Celebramos algo?" },
  ];

  return (
    <Page>
      <div className="relative">
        <HeroHeader src={cover?.url ?? "/demo/villa-pool.webp"} alt={cover?.alt ?? ""} eyebrow={eyebrow} title={`${stay.property.destination} · ${stay.property.name}`} subtitle={`${formatRange(stay.startDate, stay.endDate)} · ${stay.guestsCount} ${stay.guestsCount === 1 ? "persona" : "personas"}`} height="min-h-[340px]" />
        <div className="absolute left-0 right-0 top-0"><TopBar back="/stays" className="bg-transparent backdrop-blur-none text-ivory [&_a]:text-ivory [&_button]:text-ivory" /></div>
      </div>

      <ul className="mt-6 grid grid-cols-4 gap-2">{actions.map((a) => <li key={a.label}><IconAction href={a.href} label={a.label} Icon={a.Icon} tone="outline" /></li>)}</ul>

      {isHost && stay.status === "upcoming" && days <= 1 ? <form action={checkIn} className="mt-6"><input type="hidden" name="stayId" value={stay.id} /><Button type="submit" size="lg">Ya llegué · Check-in</Button></form> : null}
      {isHost && inStay ? <form action={checkOut} className="mt-6"><input type="hidden" name="stayId" value={stay.id} /><Button type="submit" size="lg" variant="secondary">Terminar estancia · Check-out</Button></form> : null}

      {!inStay && stay.status === "upcoming" ? (
        <Section title="Prepara tu estancia">
          <RowGroup>{prepRows.map((r) => <ListRow key={r.title} href={isHost ? `/stays/${stay.id}/prepare` : undefined} Icon={r.Icon} title={r.title} subtitle={r.sub} />)}</RowGroup>
        </Section>
      ) : null}

      <Section title={inStay ? "Próximas actividades" : "Itinerario"} action={canBook ? <Link href={`/services?stay=${stay.id}`} className="text-sm text-green-900">Agregar</Link> : null}>
        {timeline.length === 0 ? <EmptyState title="Aún no hay servicios en esta estancia." body="Chef, traslado, yate, supermercado: lo que quieras, queda aquí con su hora." cta={canBook ? { href: `/services?stay=${stay.id}`, label: "Explorar servicios" } : undefined} /> : <Timeline items={timeline} />}
      </Section>
      {timeline.length > 0 ? <div className="mt-5"><ButtonLink href={`/stays/${stay.id}/itinerary`} size="lg" variant="secondary">Ver itinerario completo</ButtonLink></div> : null}

      <Section title="Personas">
        <ul className="flex flex-wrap gap-2">{stay.guests.map((g) => <li key={g.id}><Chip tone={g.status === "accepted" ? "accent" : "neutral"}>{g.name}{g.role === "host" ? " · anfitrión" : g.status === "invited" ? " · invitado" : ""}</Chip></li>)}</ul>
      </Section>
      <Section title="La casa">
        <RowGroup>
          <ListRow Icon={Info} title={`${stay.property.destination}, ${stay.property.city}`} subtitle={`Check-in ${formatLongDate(stay.startDate)} desde 15:00 · check-out ${formatLongDate(stay.endDate)} hasta 11:00`} href={`/properties/${stay.property.id}`} />
        </RowGroup>
      </Section>
    </Page>
  );
}
