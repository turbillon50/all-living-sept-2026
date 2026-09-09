import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { ReleaseForm } from "./release-form";

export const dynamic = "force-dynamic";

/** Pantalla 19: RENTAR. Explicar con claridad qué significa liberar la semana. */
export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("owner");
  const core = fractionCore();
  const week = await core.getWeek(id);
  if (!week) notFound();
  const fraction = await core.getFraction(week.fractionId);
  if (!fraction) notFound();
  if (!(await core.getUserOwnerships(user.id)).some((o) => o.fractionId === fraction.id)) notFound();
  if (week.status !== "available") redirect(`/weeks/${week.id}`);
  return (
    <Page>
      <TopBar back={`/weeks/${week.id}`} title="Rentar mi semana" />
      <header className="pt-6 fade-up">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted">{fraction.propertyName} · {fraction.destination}</p>
        <h1 className="mt-2 text-[32px] leading-[1.06]">Libera esta semana para renta.</h1>
        <p className="mt-2 text-text-2">{formatRange(week.startDate, week.endDate)}. Deja de estar disponible para ti y pasa al inventario de renta operado por All Living.</p>
      </header>
      <ReleaseForm weekId={week.id} nights={7} commissionPct={20} />
    </Page>
  );
}
