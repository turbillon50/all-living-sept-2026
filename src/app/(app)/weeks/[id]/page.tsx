import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireRole } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { SEASON_LABEL, WEEK_STATUS } from "@/domains/fractions/labels";
import { formatLongDate, formatRange, money } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { ButtonLink } from "@/ui/button";
import { Photo } from "@/ui/photo";
import { coverFor } from "@/domains/properties/queries";

export const dynamic = "force-dynamic";

/** Pantalla 17: detalle de semana. */
export default async function WeekDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ released?: string }> }) {
  const { id } = await params;
  const { released } = await searchParams;
  const user = await requireRole("owner");
  const core = fractionCore();
  const week = await core.getWeek(id);
  if (!week) notFound();
  const fraction = await core.getFraction(week.fractionId);
  if (!fraction) notFound();
  const owns = (await core.getUserOwnerships(user.id)).some((o) => o.fractionId === fraction.id);
  if (!owns) notFound();
  const [cover, stay, inventory] = await Promise.all([
    coverFor([fraction.propertyId]).then((m) => m.get(fraction.propertyId) ?? null),
    db().query.stays.findFirst({ where: and(eq(schema.stays.fractionWeekId, week.id)) }),
    db().query.rentalInventory.findFirst({ where: eq(schema.rentalInventory.fractionWeekId, week.id) }),
  ]);
  const st = WEEK_STATUS[week.status];

  return (
    <Page>
      <TopBar back="/weeks" title="Semana" />
      {released ? <div className="mt-4 rounded-[var(--radius-card)] bg-accent-soft px-4 py-3 text-sm text-green-900" role="status">Semana liberada para renta. Te avisamos cuando haya movimiento.</div> : null}
      <header className="pt-6 fade-up">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted">{fraction.propertyName} · {fraction.destination} · Fracción {fraction.code}</p>
        <h1 className="mt-2 text-[34px] leading-[1.06]">{formatRange(week.startDate, week.endDate)}</h1>
        <div className="mt-3 flex items-center gap-2">
          <Chip tone={st.tone}>{st.label}</Chip>
          <Chip>Semana {SEASON_LABEL[week.season]}</Chip>
        </div>
      </header>
      {cover ? <Photo src={cover.url} alt={cover.alt} className="mt-6" sizes="(max-width: 768px) 100vw, 672px" /> : null}
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4"><dt className="text-muted">Llegada</dt><dd className="mt-1 font-medium capitalize">{formatLongDate(week.startDate)}</dd></div>
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4"><dt className="text-muted">Salida</dt><dd className="mt-1 font-medium capitalize">{formatLongDate(week.endDate)}</dd></div>
      </dl>

      {week.status === "available" ? (
        <div className="mt-8 grid grid-cols-3 gap-2.5">
          <ButtonLink href={`/weeks/${week.id}/use`} className="text-[13px] tracking-[0.18em] uppercase">Usar</ButtonLink>
          <ButtonLink href={`/weeks/${week.id}/release`} variant="secondary" className="text-[13px] tracking-[0.18em] uppercase">Rentar</ButtonLink>
          <ButtonLink href={`/weeks/${week.id}/exchange`} variant="secondary" className="text-[13px] tracking-[0.18em] uppercase">Intercambiar</ButtonLink>
        </div>
      ) : null}

      {stay ? (
        <section className="mt-8 rounded-[var(--radius-card)] bg-surface hairline p-4">
          <p className="text-[11px] tracking-[0.24em] uppercase text-muted">Estancia</p>
          <p className="mt-1 font-medium">{stay.guestsCount} {stay.guestsCount === 1 ? "persona" : "personas"} · {stay.status === "upcoming" ? "próxima" : stay.status === "in_progress" ? "en curso" : stay.status}</p>
          <div className="mt-3"><ButtonLink href={`/stays/${stay.id}`} size="sm" variant="secondary">Ver estancia</ButtonLink></div>
        </section>
      ) : null}

      {inventory ? (
        <section className="mt-8 rounded-[var(--radius-card)] bg-surface hairline p-4">
          <p className="text-[11px] tracking-[0.24em] uppercase text-muted">Renta</p>
          <p className="mt-1 font-medium">{inventory.status === "released" ? "Liberada, pendiente de publicar" : inventory.status === "listed" ? "Publicada" : inventory.status === "booked" ? "Rentada" : "Retirada"}</p>
          <p className="mt-1 text-sm text-text-2">
            {inventory.nightlyRateEstimate ? `Estimación por noche: ${money(inventory.nightlyRateEstimate)} (estimación, no ingreso confirmado)` : "Sin tarifa estimada"} · comisión {Number(inventory.commissionPct)}%
          </p>
          {inventory.cancellationPolicy ? <p className="mt-1 text-sm text-text-2">{inventory.cancellationPolicy}</p> : null}
          {!inventory.channel ? <p className="mt-2 text-[13px] text-muted">Ningún canal conectado todavía: Airbnb, Booking y Expedia se activan cuando exista una integración autorizada.</p> : null}
        </section>
      ) : null}
    </Page>
  );
}
