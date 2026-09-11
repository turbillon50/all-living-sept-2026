import { notFound } from "next/navigation";
import Link from "next/link";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireRole } from "@/domains/identity/current-user";
import { propertyById } from "@/domains/properties/queries";
import { INCIDENT_STATUS } from "@/domains/operations/labels";
import { formatRange } from "@/core/format";
import { Page, Section } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

/** Pantalla 52: propiedad desde operación: estancias, fracciones, incidencias, inventario básico. */
export default async function OpsProperty({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("operator");
  const p = await propertyById(id);
  if (!p) notFound();
  const [stays, fractions, incidents] = await Promise.all([
    db().select({ stay: schema.stays, host: schema.users }).from(schema.stays).innerJoin(schema.users, eq(schema.users.id, schema.stays.hostUserId)).where(and(eq(schema.stays.propertyId, id), ne(schema.stays.status, "cancelled"))).orderBy(asc(schema.stays.startDate)).limit(20),
    db().query.fractions.findMany({ where: eq(schema.fractions.propertyId, id), orderBy: asc(schema.fractions.code) }),
    db().query.incidents.findMany({ where: eq(schema.incidents.propertyId, id), orderBy: desc(schema.incidents.createdAt), limit: 20 }),
  ]);
  return (
    <Page wide>
      <TopBar back="/ops/properties" title={p.name} />
      <header className="pt-4"><h1 className="text-[32px] leading-[1.06]">{p.name}</h1><p className="mt-1 text-text-2">{p.destination} · {p.city}{p.addressPrivate ? ` · ${p.addressPrivate}` : ""}</p><p className="mt-1 text-sm text-text-2">{p.bedrooms ?? "?"} rec · {p.bathrooms ?? "?"} baños · hasta {p.maxGuests ?? "?"} pax · {fractions.length} fracciones</p></header>
      <div className="grid gap-8 md:grid-cols-2">
        <Section title="Estancias">
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{stays.map(({ stay, host }) => <li key={stay.id} className="flex justify-between px-4 py-3"><span>{formatRange(stay.startDate, stay.endDate)} · {host.name} · {stay.guestsCount} pax</span><Chip tone={stay.status === "in_progress" ? "success" : "neutral"}>{stay.status}</Chip></li>)}{stays.length === 0 ? <li className="px-4 py-3 text-text-2">Sin estancias.</li> : null}</ul>
        </Section>
        <Section title="Incidencias">
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{incidents.map((i) => <li key={i.id}><Link href={`/ops/incidents/${i.id}`} className="flex justify-between px-4 py-3 hover:bg-surface-2"><span className="truncate">{i.type} · {i.description.slice(0, 60)}</span><Chip tone={INCIDENT_STATUS[i.status]!.tone}>{INCIDENT_STATUS[i.status]!.label}</Chip></Link></li>)}{incidents.length === 0 ? <li className="px-4 py-3 text-text-2">Sin incidencias.</li> : null}</ul>
        </Section>
      </div>
      <Section title="Inventario y reglas"><p className="text-sm text-text-2">Amenidades: {p.amenities.join(", ") || "—"}. Reglas: {p.rules.join("; ") || "—"}. El inventario detallado por unidad llega con la siguiente entrega.</p></Section>
    </Page>
  );
}
