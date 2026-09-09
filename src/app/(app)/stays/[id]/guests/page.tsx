import { notFound } from "next/navigation";
import { requireUser } from "@/domains/identity/current-user";
import { stayById } from "@/domains/stays/queries";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { ButtonLink } from "@/ui/button";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

/** Pantalla 25: invitados de la estancia. */
export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const stay = await stayById(id);
  if (!stay) notFound();
  const isHost = stay.hostUserId === user.id;
  const me = stay.guests.find((g) => g.userId === user.id);
  if (!isHost && !(me && me.status === "accepted")) notFound();
  const guests = stay.guests.filter((g) => g.role === "guest");
  return (
    <Page>
      <TopBar back={`/stays/${stay.id}`} title="Invitados" action={isHost && stay.status !== "completed" ? <ButtonLink href={`/stays/${stay.id}/guests/invite`} size="sm">Invitar</ButtonLink> : null} />
      <header className="pt-4 fade-up">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted">{stay.property.name} · {formatRange(stay.startDate, stay.endDate)}</p>
        <h1 className="mt-2 text-[32px] leading-[1.06]">Quién viene contigo</h1>
        <p className="mt-2 text-text-2">Hasta {stay.property.maxGuests ?? 6} personas en esta casa. Cada invitado recibe su liga y ve solo lo que le compartes.</p>
      </header>
      <section className="mt-8">
        {guests.length === 0 ? (
          <EmptyState title="No has agregado invitados." body="Comparte tu estancia con quien viaja contigo." cta={isHost ? { href: `/stays/${stay.id}/guests/invite`, label: "Invitar a alguien" } : undefined} />
        ) : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">
            {guests.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0"><p className="font-medium truncate">{g.name}</p><p className="text-sm text-text-2 truncate">{g.email ?? g.phone ?? "Sin contacto"}{g.permissions?.can_book_services ? " · puede reservar servicios" : ""}</p></div>
                <Chip tone={g.status === "accepted" ? "success" : g.status === "declined" ? "danger" : "neutral"}>{g.status === "accepted" ? "Aceptó" : g.status === "declined" ? "Declinó" : "Invitado"}</Chip>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}
