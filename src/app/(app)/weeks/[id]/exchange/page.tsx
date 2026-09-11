import { notFound } from "next/navigation";
import { requireRole } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { SEASON_LABEL } from "@/domains/fractions/labels";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

/** Pantalla 20: INTERCAMBIAR (beta). UX y modelo listos; sin motor de pricing ni inventario cruzado todavía. */
export default async function ExchangePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("owner");
  const core = fractionCore();
  const week = await core.getWeek(id);
  if (!week) notFound();
  const fraction = await core.getFraction(week.fractionId);
  if (!fraction) notFound();
  if (!(await core.getUserOwnerships(user.id)).some((o) => o.fractionId === fraction.id)) notFound();
  return (
    <Page>
      <TopBar back={`/weeks/${week.id}`} title="Intercambiar" action={<Chip tone="warning">Beta</Chip>} />
      <header className="pt-6 fade-up">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted">Entregas</p>
        <h1 className="mt-2 text-[32px] leading-[1.06]">{formatRange(week.startDate, week.endDate)}</h1>
        <p className="mt-1 text-text-2">{fraction.propertyName} · semana {SEASON_LABEL[week.season]}</p>
      </header>
      <section className="mt-8">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted mb-3">Obtienes</p>
        <EmptyState
          title="Todavía no hay semanas equivalentes disponibles."
          body="El intercambio compara temporada y valor entre titulares de la red. Cuando existan semanas ofrecidas por otros propietarios, aparecen aquí para que elijas y confirmes. No inventamos precios ni equivalencias."
        />
      </section>
    </Page>
  );
}
