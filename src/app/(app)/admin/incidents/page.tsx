import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { INCIDENT_STATUS, PRIORITY } from "@/domains/operations/labels";
import { Page, PageHeader } from "@/ui/page";
import { AdminNav } from "@/domains/admin/nav";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

export default async function AdminIncidents() {
  const rows = await db().select({ inc: schema.incidents, property: schema.properties }).from(schema.incidents).innerJoin(schema.properties, eq(schema.properties.id, schema.incidents.propertyId)).orderBy(desc(schema.incidents.createdAt)).limit(100);
  return (
    <Page wide>
      <PageHeader eyebrow="Administración" title="Incidencias" />
      <AdminNav current="/admin/incidents" />
      <ul className="mt-6 divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{rows.map(({ inc, property }) => <li key={inc.id}><Link href={`/ops/incidents/${inc.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2"><span className="min-w-0"><span className="block font-medium">{property.name} · {inc.type}</span><span className="block text-text-2 truncate">{inc.description}</span></span><span className="flex gap-1.5"><Chip tone={PRIORITY[inc.priority]!.tone}>{PRIORITY[inc.priority]!.label}</Chip><Chip tone={INCIDENT_STATUS[inc.status]!.tone}>{INCIDENT_STATUS[inc.status]!.label}</Chip></span></Link></li>)}{rows.length === 0 ? <li className="px-4 py-3 text-text-2">Sin incidencias.</li> : null}</ul>
    </Page>
  );
}
