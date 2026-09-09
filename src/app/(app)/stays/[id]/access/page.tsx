import { notFound } from "next/navigation";
import { requireUser } from "@/domains/identity/current-user";
import { stayById } from "@/domains/stays/queries";
import { accessControl } from "@/integrations/access-control";
import { issueQr } from "@/domains/identity/pass";
import { formatLongDate } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

/** Pantalla 48 (MVP check-in): instrucciones de llegada, identidad, lista, token de acceso, reglas, contacto. */
export default async function AccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const stay = await stayById(id);
  if (!stay) notFound();
  const me = stay.guests.find((g) => g.userId === user.id);
  const isHost = stay.hostUserId === user.id;
  if (!isHost && !(me && me.status === "accepted" && me.permissions?.can_view_access)) notFound();
  const active = stay.status === "upcoming" || stay.status === "in_progress";
  let svg: string | null = null;
  if (active) svg = (await issueQr({ userId: user.id, kind: "stay_access", stayId: stay.id, ttlSeconds: 60 * 15 })).svg;
  const unlock = await accessControl().unlock(stay.id);
  return (
    <Page>
      <TopBar back={`/stays/${stay.id}`} title="Acceso" />
      <header className="pt-4 fade-up">
        <h1 className="text-[32px] leading-[1.06]">{stay.property.name}</h1>
        <p className="mt-2 text-text-2">Check-in {formatLongDate(stay.startDate)} desde las 15:00 · check-out {formatLongDate(stay.endDate)} hasta las 11:00.</p>
      </header>
      {svg ? (
        <section className="mt-6 rounded-[var(--radius-card)] bg-surface hairline p-5 text-center">
          <div className="mx-auto aspect-square w-full max-w-[200px] [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="mt-3 text-[12px] text-text-2">Muéstralo al equipo en tu llegada. Se renueva cada 15 minutos.</p>
          {!unlock.ok ? <p className="mt-2 text-[12px] text-muted">Esta casa no tiene cerradura conectada: el acceso lo entrega el equipo en persona.</p> : null}
        </section>
      ) : <div className="mt-6 rounded-[var(--radius-card)] bg-surface hairline p-5 text-sm text-text-2">Esta estancia ya terminó. El acceso quedó cerrado.</div>}
      <section className="mt-8">
        <p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Personas registradas</p>
        <ul className="flex flex-wrap gap-2">{stay.guests.filter((g) => g.status === "accepted").map((g) => <li key={g.id}><Chip tone="accent">{g.name}</Chip></li>)}</ul>
      </section>
      <section className="mt-8">
        <p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Cómo llegar</p>
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm text-text-2">
          {stay.property.addressPrivate && (isHost || stay.status === "in_progress") ? <p className="text-text">{stay.property.addressPrivate}</p> : <p>La dirección exacta se comparte al confirmar tu llegada. {stay.property.destination}, {stay.property.city}.</p>}
          <p className="mt-2">Concierge 24/7 desde <a href="/support" className="text-green-900 underline underline-offset-4">Soporte</a>.</p>
        </div>
      </section>
      {stay.property.rules.length ? (
        <section className="mt-8"><p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Reglas de la casa</p><ul className="list-disc pl-5 text-sm text-text-2 space-y-1">{stay.property.rules.map((r) => <li key={r}>{r}</li>)}</ul></section>
      ) : null}
    </Page>
  );
}
