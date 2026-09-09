import { notFound } from "next/navigation";
import Link from "next/link";
import { KeyRound, Users, Sparkles, LifeBuoy, MapPin } from "lucide-react";
import { requireUser } from "@/domains/identity/current-user";
import { stayById } from "@/domains/stays/queries";
import { checkIn, checkOut } from "@/domains/stays/actions";
import { daysUntil, formatRange, formatLongDate } from "@/core/format";
import { Timeline } from "@/domains/stays/timeline";
import { Page, Section } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Photo } from "@/ui/photo";
import { Chip } from "@/ui/chip";
import { Button, ButtonLink } from "@/ui/button";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

/** Pantallas 22 y 24: Mi estancia · modo "estoy aquí" cuando está en curso. */
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
  const eyebrow = inStay ? "Estoy aquí" : stay.status === "completed" ? "Terminada" : stay.status === "cancelled" ? "Cancelada" : days === 0 ? "Hoy" : days === 1 ? "Mañana" : `En ${days} días`;
  const prep = (stay.preparation ?? {}) as Record<string, unknown>;
  const timeline = stay.bookings.map((b) => ({ id: b.booking.id, at: b.booking.scheduledAt, title: b.serviceName, subtitle: b.providerName, status: b.booking.status, href: `/bookings/${b.booking.id}` }));

  const actions = inStay
    ? [
        { href: `/stays/${stay.id}/access`, label: "Acceso", Icon: KeyRound },
        { href: `/services?stay=${stay.id}`, label: "Servicios", Icon: Sparkles },
        { href: `/support?stay=${stay.id}`, label: "Soporte", Icon: LifeBuoy },
        { href: `/stays/${stay.id}/guests`, label: "Invitados", Icon: Users },
      ]
    : [
        { href: `/stays/${stay.id}/prepare`, label: "Preparar", Icon: Sparkles },
        { href: `/stays/${stay.id}/guests`, label: "Invitados", Icon: Users },
        { href: `/stays/${stay.id}/access`, label: "Acceso", Icon: KeyRound },
        { href: `/support?stay=${stay.id}`, label: "Soporte", Icon: LifeBuoy },
      ];

  return (
    <Page>
      <TopBar back="/stays" title="Mi estancia" />
      <header className="pt-4 fade-up">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">{eyebrow}</p>
        <h1 className="mt-2 text-[34px] leading-[1.06]">{stay.property.name} · {stay.property.destination}</h1>
        <p className="mt-2 text-[17px] text-text-2">{formatRange(stay.startDate, stay.endDate)} · {stay.guestsCount} {stay.guestsCount === 1 ? "persona" : "personas"}</p>
      </header>
      {cover ? <Photo src={cover.url} alt={cover.alt} priority className="mt-6" sizes="(max-width: 768px) 100vw, 672px" /> : null}

      <div className="mt-6 grid grid-cols-4 gap-2">
        {actions.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="press flex flex-col items-center gap-1.5 rounded-[var(--radius-card)] bg-surface hairline py-3 text-[12px] font-medium hover:bg-surface-2">
            <Icon size={20} strokeWidth={1.8} className="text-green-900" aria-hidden />
            {label}
          </Link>
        ))}
      </div>

      {isHost && stay.status === "upcoming" && days <= 1 ? (
        <form action={checkIn} className="mt-5"><input type="hidden" name="stayId" value={stay.id} /><Button type="submit" size="lg">Ya llegué · Check-in</Button></form>
      ) : null}
      {isHost && inStay ? (
        <form action={checkOut} className="mt-5"><input type="hidden" name="stayId" value={stay.id} /><Button type="submit" size="lg" variant="secondary">Terminar estancia · Check-out</Button></form>
      ) : null}

      {!inStay && stay.status === "upcoming" ? (
        <Section title="Antes de llegar">
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Llegada", stay.arrivalTime ? `${stay.arrivalMode === "vuelo" ? "En vuelo" : stay.arrivalMode === "auto" ? "En auto" : "Otro"} · ${stay.arrivalTime.slice(0, 5)}` : "Sin definir"],
              ["Recogida", prep.pickup ? "Sí, la coordinamos" : "No solicitada"],
              ["Supermercado", prep.grocery ? "Listo a tu llegada" : "No solicitado"],
              ["Chef", prep.chef ? "Solicitado" : "No solicitado"],
              ["Cuna", prep.crib ? "Sí" : "No"],
              ["Niñera", prep.nanny ? "Sí" : "No"],
            ].map(([k, v]) => (
              <li key={k} className="rounded-[var(--radius-card)] bg-surface hairline p-3"><p className="text-muted">{k}</p><p className="mt-0.5 font-medium">{v}</p></li>
            ))}
          </ul>
          {typeof prep.celebration === "string" && prep.celebration ? <p className="mt-3 text-sm text-text-2">Celebración: {prep.celebration}</p> : null}
          {!prep.preparedAt && isHost ? <div className="mt-4"><ButtonLink href={`/stays/${stay.id}/prepare`} size="sm">Preparar mi estancia</ButtonLink></div> : null}
        </Section>
      ) : null}

      <Section title={inStay ? "Hoy y lo que sigue" : "Itinerario"} action={canBook ? <Link href={`/services?stay=${stay.id}`} className="text-sm text-green-900">Agregar servicio</Link> : null}>
        {timeline.length === 0 ? <EmptyState title="Aún no hay servicios en esta estancia." body="Chef, traslado, yate, supermercado: lo que quieras, queda aquí con su hora." cta={canBook ? { href: `/services?stay=${stay.id}`, label: "Explorar servicios" } : undefined} /> : <Timeline items={timeline} />}
      </Section>

      <Section title="Personas">
        <ul className="flex flex-wrap gap-2">
          {stay.guests.map((g) => (
            <li key={g.id}><Chip tone={g.status === "accepted" ? "accent" : "neutral"}>{g.name}{g.role === "host" ? " · anfitrión" : g.status === "invited" ? " · invitado" : ""}</Chip></li>
          ))}
        </ul>
      </Section>

      <Section title="La casa">
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm">
          <p className="flex items-center gap-2 text-text-2"><MapPin size={16} aria-hidden /> {stay.property.destination}, {stay.property.city}</p>
          <p className="mt-2 text-text-2">Check-in {formatLongDate(stay.startDate)} desde las 15:00 · check-out {formatLongDate(stay.endDate)} hasta las 11:00.</p>
          {stay.property.rules.length ? <ul className="mt-2 list-disc pl-5 text-text-2">{stay.property.rules.map((r) => <li key={r}>{r}</li>)}</ul> : null}
          <Link href={`/properties/${stay.property.id}`} className="mt-3 inline-block text-green-900 underline underline-offset-4">Ver la propiedad</Link>
        </div>
      </Section>
    </Page>
  );
}
