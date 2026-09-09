import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";
import { fractionCore, weeksForOwner } from "@/domains/fractions/local-fraction-core";
import { nextStayFor, staysForUser, recentNotifications } from "@/domains/stays/queries";
import { coverFor } from "@/domains/properties/queries";
import { demoAvailable } from "@/domains/identity/demo";
import { claimDemo } from "@/domains/home/actions";
import { QuickActions } from "@/domains/home/quick-actions";
import { daysUntil, firstName, formatRange } from "@/core/format";
import { Page, Section } from "@/ui/page";
import { Photo } from "@/ui/photo";
import { Button, ButtonLink } from "@/ui/button";
import { EmptyState } from "@/ui/empty-state";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

/** Pantallas 09/10: Home owner y guest. Responde "¿qué está pasando conmigo y mi próxima estancia?". */
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
  const heroPhoto = (next && next.cover) ?? (main && covers.get(main.propertyId)) ?? null;
  const weeks = user.activeContext === "owner" ? await weeksForOwner(user.id) : [];
  const nextAvailableWeek = weeks.find((w) => w.week.status === "available");
  const isOwner = user.activeContext === "owner" && ownerships.length > 0;

  const contextLine = next
    ? next.status === "in_progress"
      ? `Estás en ${next.destination}. Tu estancia sigue hasta el ${formatRange(next.startDate, next.endDate).split("–")[1]?.trim() ?? ""}.`
      : `Tu próxima estancia es ${next.destination} · ${formatRange(next.startDate, next.endDate)}.`
    : isOwner
      ? "No tienes estancias próximas. Tus semanas te esperan."
      : "Cuando te inviten a una estancia, la verás aquí.";

  return (
    <Page>
      <header className="pt-10 md:pt-14 fade-up">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">{next ? (next.status === "in_progress" ? "Estoy aquí" : `En ${daysUntil(next.startDate)} días`) : "Hoy"}</p>
        <h1 className="mt-2 text-[34px] leading-[1.06] md:text-[46px]">Hola, {firstName(user.name)}.</h1>
        <p className="mt-3 text-[17px] text-text-2 max-w-md">{contextLine}</p>
      </header>

      {heroPhoto ? (
        <Link href={next ? `/stays/${next.id}` : main ? `/properties/${main.propertyId}` : "/explore"} className="mt-7 block press">
          <Photo src={heroPhoto.url} alt={heroPhoto.alt} priority sizes="(max-width: 768px) 100vw, 672px" className="shadow-[var(--shadow-card)]" />
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-serif text-[20px]">{next?.propertyName ?? main?.propertyName}</p>
              <p className="text-sm text-text-2">{next?.destination ?? main?.destination}{main ? ` · Fracción ${main.fractionCode}` : ""}</p>
            </div>
            {next ? <Chip tone={next.status === "in_progress" ? "success" : "accent"}>{next.status === "in_progress" ? "En curso" : "Próxima"}</Chip> : null}
          </div>
        </Link>
      ) : null}

      {isOwner ? (
        <div className="mt-7 grid grid-cols-3 gap-2.5">
          <ButtonLink href={nextAvailableWeek ? `/weeks/${nextAvailableWeek.week.id}/use` : "/weeks"} size="md" className="flex-col gap-0.5 py-3 text-[13px] tracking-[0.18em] uppercase">
            Usar
          </ButtonLink>
          <ButtonLink href={nextAvailableWeek ? `/weeks/${nextAvailableWeek.week.id}/release` : "/weeks"} variant="secondary" className="flex-col gap-0.5 py-3 text-[13px] tracking-[0.18em] uppercase">
            Rentar
          </ButtonLink>
          <ButtonLink href="/weeks?intent=exchange" variant="secondary" className="flex-col gap-0.5 py-3 text-[13px] tracking-[0.18em] uppercase">
            Intercambiar
          </ButtonLink>
        </div>
      ) : null}

      <Section>
        <QuickActions stayId={next?.id} />
      </Section>

      {!isOwner && !next && canClaim ? (
        <Section>
          <div className="rounded-[var(--radius-card)] bg-surface hairline p-5">
            <Chip>Demo</Chip>
            <p className="mt-3 font-serif text-[20px]">Ver All Living con datos de demostración</p>
            <p className="mt-1 text-sm text-text-2">Casa Mar · Tulum, la fracción F07 y una estancia en diciembre. Todo marcado como demo.</p>
            <form action={claimDemo} className="mt-4">
              <Button type="submit" variant="secondary" size="sm">Activar demo</Button>
            </form>
          </div>
        </Section>
      ) : null}

      <Section title="Próximas estancias" action={stays.length > 1 ? <Link href="/stays" className="text-sm text-green-900">Ver todas</Link> : null}>
        {stays.length === 0 ? (
          <EmptyState title="No tienes estancias próximas." body={isOwner ? "Elige una semana y prepárala." : undefined} cta={isOwner ? { href: "/weeks", label: "Ver mis semanas" } : undefined} />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {stays.slice(0, 3).map((s) => (
              <li key={s.id}>
                <Link href={`/stays/${s.id}`} className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-3 hover:bg-surface-2">
                  {s.cover ? <Photo src={s.cover.url} alt="" className="w-20 shrink-0" ratio="1/1" sizes="80px" /> : <span className="size-20 rounded-[var(--radius-ctl)] bg-sand-200" />}
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium truncate">{s.propertyName} · {s.destination}</span>
                    <span className="block text-sm text-text-2">{formatRange(s.startDate, s.endDate)} · {s.guestsCount} {s.guestsCount === 1 ? "persona" : "personas"}</span>
                  </span>
                  <Chip tone={s.status === "in_progress" ? "success" : "neutral"}>{s.status === "in_progress" ? "En curso" : s.isHost ? "Anfitrión" : "Invitado"}</Chip>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {notes.length > 0 ? (
        <Section title="Actividad reciente" action={<Link href="/notifications" className="text-sm text-green-900">Ver todo</Link>}>
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">
            {notes.map((n) => (
              <li key={n.id}>
                <Link href={n.deepLink ?? "/notifications"} className="block px-4 py-3 hover:bg-surface-2">
                  <p className="text-[15px] font-medium">{n.title}</p>
                  {n.body ? <p className="text-sm text-text-2">{n.body}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </Page>
  );
}
