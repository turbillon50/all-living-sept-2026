import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/domains/identity/current-user";
import { stayById } from "@/domains/stays/queries";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { PrepareForm } from "./prepare-form";

export const dynamic = "force-dynamic";

/** Pantalla 23: preparar estancia. Pocas preguntas, las que cambian la llegada. */
export default async function PrepareStay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const stay = await stayById(id);
  if (!stay || stay.hostUserId !== user.id) notFound();
  if (stay.status !== "upcoming") redirect(`/stays/${stay.id}`);
  const prep = (stay.preparation ?? {}) as Record<string, unknown>;
  return (
    <Page>
      <TopBar back={`/stays/${stay.id}`} title="Preparar estancia" />
      <header className="pt-4 fade-up">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted">{stay.property.name} · {formatRange(stay.startDate, stay.endDate)}</p>
        <h1 className="mt-2 text-[32px] leading-[1.06]">¿Cómo quieres llegar?</h1>
        <p className="mt-2 text-text-2">Con esto concierge deja todo listo antes de que abras la puerta.</p>
      </header>
      <PrepareForm stayId={stay.id} defaults={{ arrivalMode: stay.arrivalMode ?? "vuelo", arrivalTime: stay.arrivalTime?.slice(0, 5) ?? "16:00", pickup: Boolean(prep.pickup), grocery: Boolean(prep.grocery), chef: Boolean(prep.chef), crib: Boolean(prep.crib), nanny: Boolean(prep.nanny), celebration: typeof prep.celebration === "string" ? prep.celebration : "", flight: typeof prep.flight === "string" ? prep.flight : "" }} />
    </Page>
  );
}
