import { notFound } from "next/navigation";
import { requireUser } from "@/domains/identity/current-user";
import { stayById } from "@/domains/stays/queries";
import { formatRange } from "@/core/format";
import { Timeline } from "@/domains/stays/timeline";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const stay = await stayById(id);
  if (!stay) notFound();
  const me = stay.guests.find((g) => g.userId === user.id);
  if (stay.hostUserId !== user.id && !(me && me.status === "accepted")) notFound();
  const items = stay.bookings.map((b) => ({ id: b.booking.id, at: b.booking.scheduledAt, title: b.serviceName, subtitle: b.providerName, status: b.booking.status, href: `/bookings/${b.booking.id}` }));
  return (
    <Page>
      <TopBar back={`/stays/${stay.id}`} title="Itinerario" />
      <header className="pt-4"><p className="text-[11px] tracking-[0.24em] uppercase text-muted">{stay.property.destination} · {stay.property.name}</p><h1 className="mt-2 text-[30px] leading-[1.06]">{formatRange(stay.startDate, stay.endDate)}</h1></header>
      <div className="mt-4">{items.length === 0 ? <EmptyState title="Aún no hay actividades." cta={{ href: `/services?stay=${stay.id}`, label: "Agregar servicio" }} /> : <Timeline items={items} />}</div>
    </Page>
  );
}
