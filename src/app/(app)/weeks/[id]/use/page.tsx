import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { propertyById } from "@/domains/properties/queries";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { UseWeekForm } from "./use-form";

export const dynamic = "force-dynamic";

/** Pantalla 18: USAR una semana. Confirmar quién viaja, cuántos, llegada, reglas. */
export default async function UseWeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("owner");
  const core = fractionCore();
  const week = await core.getWeek(id);
  if (!week) notFound();
  const fraction = await core.getFraction(week.fractionId);
  if (!fraction) notFound();
  if (!(await core.getUserOwnerships(user.id)).some((o) => o.fractionId === fraction.id)) notFound();
  if (week.status !== "available") redirect(`/weeks/${week.id}`);
  const property = await propertyById(fraction.propertyId);
  return (
    <Page>
      <TopBar back={`/weeks/${week.id}`} title="Usar mi semana" />
      <header className="pt-6 fade-up">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted">{fraction.propertyName} · {fraction.destination}</p>
        <h1 className="mt-2 text-[32px] leading-[1.06]">{formatRange(week.startDate, week.endDate)}</h1>
        <p className="mt-2 text-text-2">Confirmamos lo esencial y la preparamos contigo.</p>
      </header>
      <UseWeekForm weekId={week.id} maxGuests={property?.maxGuests ?? 8} rules={property?.rules ?? []} />
    </Page>
  );
}
