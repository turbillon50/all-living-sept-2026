import Link from "next/link";
import { requireUser } from "@/domains/identity/current-user";
import { staysForUser } from "@/domains/stays/queries";
import { formatRange } from "@/core/format";
import { Page, PageHeader } from "@/ui/page";
import { Photo } from "@/ui/photo";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

/** Pantalla 21: estancias. */
export default async function StaysPage() {
  const user = await requireUser();
  const stays = await staysForUser(user.id);
  const upcoming = stays.filter((s) => s.status !== "completed");
  const past = stays.filter((s) => s.status === "completed");
  return (
    <Page wide>
      <PageHeader eyebrow="VIAJAR" title="Mis viajes" description="Tu estancia y todo lo que ocurre alrededor, en un solo lugar." />
      {upcoming.length === 0 ? (
        <EmptyState title="No tienes estancias próximas." body="Cuando tengas una estancia, tu viaje aparecerá aquí." cta={user.activeContext === "owner" ? { href: "/weeks", label: "Ver mis semanas" } : undefined} />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {upcoming.map((s) => (
            <li key={s.id}>
              <Link href={`/stays/${s.id}`} className="press block">
                {s.cover ? <Photo src={s.cover.url} alt={s.cover.alt} sizes="(max-width: 768px) 100vw, 50vw" ratio="16/9" /> : null}
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-[20px]">{s.propertyName} · {s.destination}</p>
                    <p className="text-sm text-text-2">{formatRange(s.startDate, s.endDate)} · {s.guestsCount} {s.guestsCount === 1 ? "persona" : "personas"}</p>
                  </div>
                  <Chip tone={s.status === "in_progress" ? "success" : "accent"}>{s.status === "in_progress" ? "En curso" : "Próxima"}</Chip>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {past.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-[19px]">Anteriores</h2>
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">
            {past.map((s) => (
              <li key={s.id}><Link href={`/stays/${s.id}`} className="block px-4 py-3 hover:bg-surface-2">{s.propertyName} · {formatRange(s.startDate, s.endDate)}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}
    </Page>
  );
}
