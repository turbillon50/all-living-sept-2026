import Link from "next/link";
import { asc, desc, inArray } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireRole } from "@/domains/identity/current-user";
import { upcomingStays } from "@/domains/operations/queries";
import { INCIDENT_STATUS, PRIORITY } from "@/domains/operations/labels";
import { formatRange } from "@/core/format";
import { Page, PageHeader, Section } from "@/ui/page";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

/** Pantalla 53: tareas de operación. Incidencias abiertas y preparación de próximas llegadas. */
export default async function OpsTasks() {
  await requireRole("operator");
  const [incidents, stays] = await Promise.all([
    db().query.incidents.findMany({ where: inArray(schema.incidents.status, ["open", "assigned", "in_progress", "resolved"]), orderBy: [desc(schema.incidents.priority), asc(schema.incidents.createdAt)] }),
    upcomingStays(14),
  ]);
  return (
    <Page wide>
      <PageHeader eyebrow="Operación" title="Tareas" />
      <Section title="Incidencias">
        {incidents.length === 0 ? <p className="text-sm text-text-2">Nada abierto.</p> : <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{incidents.map((inc) => <li key={inc.id}><Link href={`/ops/incidents/${inc.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2"><span className="min-w-0"><span className="block font-medium capitalize">{inc.type}</span><span className="block text-text-2 truncate">{inc.description}</span></span><span className="flex gap-1.5"><Chip tone={PRIORITY[inc.priority]!.tone}>{PRIORITY[inc.priority]!.label}</Chip><Chip tone={INCIDENT_STATUS[inc.status]!.tone}>{INCIDENT_STATUS[inc.status]!.label}</Chip></span></Link></li>)}</ul>}
      </Section>
      <Section title="Preparar llegadas · 14 días">
        {stays.length === 0 ? <p className="text-sm text-text-2">Sin llegadas próximas.</p> : <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{stays.map(({ stay, property, host }) => { const p = (stay.preparation ?? {}) as Record<string, unknown>; return <li key={stay.id} className="flex items-center justify-between gap-3 px-4 py-3"><span className="min-w-0"><span className="block font-medium">{property.name} · {formatRange(stay.startDate, stay.endDate)}</span><span className="block text-text-2">{host.name} · {stay.guestsCount} pax{p.grocery ? " · súper" : ""}{p.chef ? " · chef" : ""}{p.pickup ? " · recogida" : ""}{p.crib ? " · cuna" : ""}</span></span><Chip tone={p.preparedAt ? "success" : "warning"}>{p.preparedAt ? "Preparación recibida" : "Sin preparación"}</Chip></li>; })}</ul>}
      </Section>
    </Page>
  );
}
