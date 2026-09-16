import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck, KeyRound, Repeat, ShieldCheck } from "@/ui/icons";
import { requireUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";
import { fractionCore, weeksForOwner } from "@/domains/fractions/local-fraction-core";
import { nextStayFor, staysForUser, recentNotifications } from "@/domains/stays/queries";
import { coverFor } from "@/domains/properties/queries";
import { QuickActions } from "@/domains/home/quick-actions";
import { daysUntil, firstName, formatRange } from "@/core/format";
import { SEASON_LABEL } from "@/domains/fractions/labels";
import { Page, Section } from "@/ui/page";
import { EmptyState } from "@/ui/empty-state";
import { Chip } from "@/ui/chip";
import { HeroHeader, IconAction, ListRow, RowGroup } from "@/ui/primitives";
import { TravelTabs } from "@/ui/travel-tabs";

export const dynamic = "force-dynamic";

/** Pantallas 09/10: Home. Hero a sangre con saludo, tarjeta flotante, tres acciones en círculo, acciones rápidas. */
export default async function HomePage() {
  const user = await requireUser();
  if (user.activeContext !== "owner" && user.activeContext !== "guest") redirect(homeFor(user.activeContext));

  const [ownerships, next, stays, notes] = await Promise.all([
    fractionCore().getUserOwnerships(user.id),
    nextStayFor(user.id),
    staysForUser(user.id),
    recentNotifications(user.id, 3),
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
    <Page wide>
      <TravelTabs />
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

      <Section title="El Caribe, a tu manera" action={<Link href="/explore" className="text-sm text-[#087c98]">Explorar</Link>}>
        <div className="home-destination-grid">
          <Link href="/explore?destination=Canc%C3%BAn" className="home-editorial-card home-editorial-card--wide"><Image src="/demo/palms.webp" alt="Cancún" fill sizes="(max-width:768px) 100vw,50vw"/><span className="home-editorial-shade"/><span className="home-editorial-copy"><small>EXPLORA</small><strong>Cancún</strong><em>Mar, islas y ciudad</em></span></Link>
          <Link href="/explore?destination=Playa%20del%20Carmen" className="home-editorial-card"><Image src="/demo/villa-pool.webp" alt="Playa del Carmen" fill sizes="(max-width:768px) 50vw,25vw"/><span className="home-editorial-shade"/><span className="home-editorial-copy"><small>EXPLORA</small><strong>Playa del Carmen</strong><em>Riviera y vida a pie</em></span></Link>
          <Link href="/explore?destination=Tulum" className="home-editorial-card"><Image src="/demo/tulum-sea.webp" alt="Tulum" fill sizes="(max-width:768px) 50vw,25vw"/><span className="home-editorial-shade"/><span className="home-editorial-copy"><small>EXPLORA</small><strong>Tulum</strong><em>Mar, selva y calma</em></span></Link>
        </div>
      </Section>

      <Section title="Todo alrededor de tu viaje">
        <div className="journey-editorial-grid">
          <Link href="/flights" className="journey-editorial-card"><Image src="/demo/sunset.webp" alt="Vuelos" fill sizes="(max-width:768px) 50vw,25vw"/><span/><strong>Vuelos</strong></Link>
          <Link href="/services/yachts" className="journey-editorial-card"><Image src="/demo/yacht.webp" alt="Yates" fill sizes="(max-width:768px) 50vw,25vw"/><span/><strong>Yates</strong></Link>
          <Link href="/services/chefs" className="journey-editorial-card"><Image src="/demo/chef.webp" alt="Chefs" fill sizes="(max-width:768px) 50vw,25vw"/><span/><strong>Chefs</strong></Link>
          <Link href="/services/transport" className="journey-editorial-card"><Image src="/demo/city.webp" alt="Transporte" fill sizes="(max-width:768px) 50vw,25vw"/><span/><strong>Transporte</strong></Link>
        </div>
      </Section>

      <Section title="Acciones rápidas">
        <QuickActions stayId={next?.id} />
      </Section>

      <Link href="/garantia-all-living" className="mt-7 flex items-center gap-4 rounded-[22px] bg-[#dff5f7] px-5 py-4 text-[#07394b] transition-[transform,box-shadow] duration-200 active:scale-[.99] md:max-w-2xl md:hover:-translate-y-0.5 md:hover:shadow-[0_12px_32px_rgb(3_119_151_/_0.10)]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/75 shadow-sm"><ShieldCheck size={21} /></span>
        <span className="min-w-0 flex-1"><span className="block text-[15px] font-medium">Garantía All Living</span><span className="mt-0.5 block text-[12px] leading-5 text-[#356875]">Si una estancia protegida falla por una incidencia cubierta, activamos reubicación equivalente o superior según disponibilidad y términos.</span></span>
        <span aria-hidden className="text-[#0b789a]">→</span>
      </Link>

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
