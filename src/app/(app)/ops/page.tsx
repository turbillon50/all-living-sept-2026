import Link from "next/link";
import { requireRole } from "@/domains/identity/current-user";
import { opsToday } from "@/domains/operations/queries";
import { INCIDENT_STATUS, PRIORITY } from "@/domains/operations/labels";
import { BOOKING_STATUS } from "@/domains/bookings/labels";
import { Page, PageHeader, Section } from "@/ui/page";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

/** Pantalla 51: Operator Today. Funcional, móvil y escritorio. Nunca se mezcla con la experiencia del propietario. */
export default async function OpsToday() {
  await requireRole("operator");
  const t = await opsToday();
  const fmtTime = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });
  const tiles = [["Check-ins", t.checkIns.length], ["Check-outs", t.checkOuts.length], ["Incidencias abiertas", t.incidents.length], ["Servicios hoy", t.services.length]] as const;
  return (
    <Page wide>
      <PageHeader eyebrow="Operación" title="Hoy" description={new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date())} />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles.map(([k, v]) => <li key={k} className="rounded-[var(--radius-card)] bg-surface hairline p-4"><p className="text-[12px] text-muted">{k}</p><p className="mt-1 font-serif text-[28px]">{v}</p></li>)}</ul>
      <div className="grid gap-8 md:grid-cols-2">
        <Section title="Llegadas">
          {t.checkIns.length === 0 ? <p className="text-sm text-text-2">Sin llegadas hoy.</p> : <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{t.checkIns.map(({ stay, property, host }) => <li key={stay.id} className="flex justify-between px-4 py-3"><span><span className="block font-medium">{property.name}</span><span className="text-text-2">{host.name} · {stay.guestsCount} pax · {stay.arrivalTime?.slice(0, 5) ?? "hora por confirmar"}</span></span><Link href={`/ops/properties/${property.id}`} className="text-green-900">Ver</Link></li>)}</ul>}
        </Section>
        <Section title="Salidas">
          {t.checkOuts.length === 0 ? <p className="text-sm text-text-2">Sin salidas hoy.</p> : <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{t.checkOuts.map(({ stay, property, host }) => <li key={stay.id} className="flex justify-between px-4 py-3"><span><span className="block font-medium">{property.name}</span><span className="text-text-2">{host.name}</span></span><Chip>{stay.status}</Chip></li>)}</ul>}
        </Section>
        <Section title="Incidencias" action={<Link href="/ops/tasks" className="text-sm text-green-900">Todas</Link>}>
          {t.incidents.length === 0 ? <p className="text-sm text-text-2">Nada abierto.</p> : <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{t.incidents.slice(0, 6).map(({ inc, property }) => <li key={inc.id}><Link href={`/ops/incidents/${inc.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2"><span className="min-w-0"><span className="block font-medium truncate">{property.name} · {inc.type}</span><span className="block text-text-2 truncate">{inc.description}</span></span><span className="flex gap-1.5"><Chip tone={PRIORITY[inc.priority]!.tone}>{PRIORITY[inc.priority]!.label}</Chip><Chip tone={INCIDENT_STATUS[inc.status]!.tone}>{INCIDENT_STATUS[inc.status]!.label}</Chip></span></Link></li>)}</ul>}
        </Section>
        <Section title="Servicios de hoy">
          {t.services.length === 0 ? <p className="text-sm text-text-2">Sin servicios hoy.</p> : <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{t.services.map(({ b, service, provider, property }) => <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3"><span className="min-w-0"><span className="block font-medium truncate">{fmtTime.format(b.scheduledAt)} · {service.name}</span><span className="block text-text-2 truncate">{provider.businessName}{property ? ` · ${property.name}` : ""}</span></span><Chip tone={BOOKING_STATUS[b.status]!.tone}>{BOOKING_STATUS[b.status]!.label}</Chip></li>)}</ul>}
        </Section>
      </div>
    </Page>
  );
}
