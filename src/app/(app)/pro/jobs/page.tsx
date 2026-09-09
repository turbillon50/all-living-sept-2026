import Link from "next/link";
import { requireRole } from "@/domains/identity/current-user";
import { providerForUser, jobsForProvider } from "@/domains/providers/queries";
import { BOOKING_STATUS } from "@/domains/bookings/labels";
import { money } from "@/core/format";
import { Page, PageHeader } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

/** Agenda del proveedor: todo lo que viene, agrupado por día. */
export default async function ProJobs() {
  const user = await requireRole("provider");
  const prov = await providerForUser(user.id);
  if (!prov) return <Page><PageHeader eyebrow="Servicios" title="Agenda" /><EmptyState title="Aún no tienes perfil de proveedor." cta={{ href: "/pro/onboarding", label: "Crear perfil" }} /></Page>;
  const jobs = await jobsForProvider(prov.id);
  const fmtDay = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const fmtTime = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });
  const groups = new Map<string, typeof jobs>();
  for (const j of jobs) { const k = fmtDay.format(j.b.scheduledAt); groups.set(k, [...(groups.get(k) ?? []), j]); }
  return (
    <Page>
      <PageHeader eyebrow="Servicios" title="Agenda" />
      {jobs.length === 0 ? <EmptyState title="Sin servicios agendados." body="Cuando alguien te solicite, aparece aquí." /> : (
        [...groups.entries()].map(([day, list]) => (
          <section key={day} className="mb-6">
            <h2 className="mb-2 text-[12px] tracking-[0.24em] uppercase text-muted font-sans font-medium capitalize">{day}</h2>
            <ul className="flex flex-col gap-2">
              {list.map(({ b, service, property }) => { const st = BOOKING_STATUS[b.status] ?? { label: b.status, tone: "neutral" as const }; return (
                <li key={b.id}><Link href={`/pro/jobs/${b.id}`} className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-4 hover:bg-surface-2"><span className="w-12 shrink-0 font-serif text-[18px]">{fmtTime.format(b.scheduledAt)}</span><span className="min-w-0 flex-1"><span className="block font-medium truncate">{service.name}</span><span className="block text-sm text-text-2 truncate">{property ? `${property.name} · ${property.city}` : "Sin propiedad"} · {money(b.total, b.currency)}</span></span><Chip tone={st.tone}>{st.label}</Chip></Link></li>
              ); })}
            </ul>
          </section>
        ))
      )}
    </Page>
  );
}
