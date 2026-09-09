import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck, KeyRound, Repeat } from "lucide-react";
import { requireUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";
import { fractionCore, weeksForOwner } from "@/domains/fractions/local-fraction-core";
import { nextStayFor, staysForUser, recentNotifications } from "@/domains/stays/queries";
import { coverFor } from "@/domains/properties/queries";
import { demoAvailable } from "@/domains/identity/demo";
import { claimDemo } from "@/domains/home/actions";
import { QuickActions } from "@/domains/home/quick-actions";
import { daysUntil, firstName, formatRange } from "@/core/format";
import { SEASON_LABEL } from "@/domains/fractions/labels";
import { Page, Section } from "@/ui/page";
import { Button } from "@/ui/button";
import { EmptyState } from "@/ui/empty-state";
import { Chip } from "@/ui/chip";
import { Card, HeroHeader, IconAction, ListRow, RowGroup } from "@/ui/primitives";

export const dynamic = "force-dynamic";

/** Pantallas 09/10: Home. Hero a sangre con saludo, tarjeta flotante, tres acciones en círculo, acciones rápidas. */
export default async function HomePage() {
  const user = await requireUser();
  if (user.activeContext !== "owner" && user.activeContext !== "guest") redirect(homeFor(user.activeContext));

  const [ownerships, next, stays, notes, canClaim] = await Promise.all([
    fractionCore().getUserOwnerships(user.id),
    nextStayFor(user.id),
    staysForUser(user.id),
    recentNotifications(user.id, 3),
    demoAvailable(),
  ]);
  const main = ownerships[0] ?? null;
  const covers = await coverFor([...(main ? [main.propertyId] : []), ...(next ? [next.propertyId] : [])]);
  const hero = (next && next.cover) ?? (main && covers.get(main.propertyId)) ?? { url: "/demo/tulum-sea.webp", alt: "Mar Caribe" };
  const weeks = user.activeContext === "owner" ? await weeksForOwner(user.id) : [];
  const nextWeek = weeks.find((w) => w.week.status === "available");
  const nextWeekInfo = next ? weeks.find((w) => w.week.startDate === next.startDate) : null;
  const isOwner = user.activeContext === "owner" && ownerships.length > 0;
  const days = next ? daysUntil(next.startDate) : null;
  const subtitle = next
    ? next.status === "in_progress"
      ? `Estás en ${next.destination}. Disfruta.`
      : `Tu próxima estancia es en ${next.destination}, ${days === 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`}.`
    : isOwner
      ? "Tus semanas te esperan. Elige cuándo."
      : "Cuando te inviten a una estancia, la verás aquí.";

  return (
    <Page>
      <HeroHeader src={hero.url} alt={hero.alt} title={`Hola, ${firstName(user.name)}.`} subtitle={subtitle} height="min-h-[420px] md:min-h-[440px]">
        {next || main ? (
          <Link href={next ? `/stays/${next.id}` : `/properties/${main!.propertyId}`} className="press flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-3 text-text shadow-[var(--shadow-float)]">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-[12px] bg-sand-200">
              {(next?.cover ?? covers.get(main?.propertyId ?? ""))?.url ? <Image src={(next?.cover ?? covers.get(main?.propertyId ?? ""))!.url} alt="" fill sizes="56px" className="object-cover" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium truncate">{(next?.destination ?? main?.destination) + " · " + (next?.propertyName ?? main?.propertyName)}</span>
              <span className="block text-[13px] text-text-2 truncate">{next ? formatRange(next.startDate, next.endDate) : main ? `Fracción ${main.fractionCode}` : ""}</span>
              {main ? <span className="block text-[12px] text-muted truncate">Fracción {main.fractionCode}{nextWeekInfo ? ` · Semana ${SEASON_LABEL[nextWeekInfo.week.season]}` : ""}</span> : null}
            </span>
            <ArrowRight size={18} className="text-muted" aria-hidden />
          </Link>
        ) : null}
      </HeroHeader>

      {isOwner ? (
        <ul className="mt-7 grid grid-cols-3 gap-3 md:flex md:gap-10">
          <li><IconAction href={nextWeek ? `/weeks/${nextWeek.week.id}/use` : "/weeks"} label="Usar" Icon={CalendarCheck} tone="soft" /></li>
          <li><IconAction href={nextWeek ? `/weeks/${nextWeek.week.id}/release` : "/weeks"} label="Rentar" Icon={KeyRound} tone="soft" /></li>
          <li><IconAction href={nextWeek ? `/weeks/${nextWeek.week.id}/exchange` : "/weeks"} label="Intercambiar" Icon={Repeat} tone="soft" /></li>
        </ul>
      ) : null}

      <Section title="Acciones rápidas">
        <QuickActions stayId={next?.id} />
      </Section>

      {!isOwner && !next && canClaim ? (
        <Section>
          <Card className="p-5">
            <Chip>Demo</Chip>
            <p className="mt-3 font-serif text-[20px]">Ver All Living con datos de demostración</p>
            <p className="mt-1 text-sm text-text-2">Casa Mar · Tulum, la fracción F07 y una estancia en diciembre. Todo marcado como demo.</p>
            <form action={claimDemo} className="mt-4"><Button type="submit" variant="secondary" size="sm">Activar demo</Button></form>
          </Card>
        </Section>
      ) : null}

      <Section title="Próximas estancias" action={stays.length > 1 ? <Link href="/stays" className="text-sm text-green-900">Ver todas</Link> : null}>
        {stays.length === 0 ? (
          <EmptyState title="No tienes estancias próximas." body={isOwner ? "Elige una semana y prepárala." : undefined} cta={isOwner ? { href: "/weeks", label: "Ver mis semanas" } : undefined} />
        ) : (
          <RowGroup>
            {stays.slice(0, 3).map((s) => (
              <ListRow key={s.id} href={`/stays/${s.id}`} title={`${s.destination} · ${s.propertyName}`} subtitle={`${formatRange(s.startDate, s.endDate)} · ${s.guestsCount} ${s.guestsCount === 1 ? "persona" : "personas"}`} right={<Chip tone={s.status === "in_progress" ? "success" : "accent"}>{s.status === "in_progress" ? "En curso" : "Próxima"}</Chip>} />
            ))}
          </RowGroup>
        )}
      </Section>

      {notes.length > 0 ? (
        <Section title="Actividad reciente" action={<Link href="/notifications" className="text-sm text-green-900">Ver todo</Link>}>
          <RowGroup>{notes.map((n) => <ListRow key={n.id} href={n.deepLink ?? "/notifications"} title={n.title} subtitle={n.body ?? undefined} />)}</RowGroup>
        </Section>
      ) : null}
    </Page>
  );
}
