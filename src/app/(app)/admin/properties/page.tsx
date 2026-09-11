import { asc, count } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { Page, PageHeader } from "@/ui/page";
import { AdminNav } from "@/domains/admin/nav";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

export default async function AdminProperties() {
  const props = await db().query.properties.findMany({ orderBy: asc(schema.properties.name) });
  const fr = await db().select({ propertyId: schema.fractions.propertyId, n: count() }).from(schema.fractions).groupBy(schema.fractions.propertyId);
  const map = new Map(fr.map((f) => [f.propertyId, f.n]));
  return (
    <Page wide>
      <PageHeader eyebrow="Administración" title="Propiedades" />
      <AdminNav current="/admin/properties" />
      <ul className="mt-6 divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{props.map((p) => <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3"><span><span className="block font-medium">{p.name} · {p.destination}</span><span className="text-text-2">{p.slug} · {map.get(p.id) ?? 0} fracciones{p.isDemo ? " · demo" : ""}</span></span><Chip tone={p.status === "active" ? "success" : "neutral"}>{p.status}</Chip></li>)}</ul>
      <p className="mt-4 text-[12px] text-muted">Alta y edición de propiedades: por Fraction Core / V&LIVING o script de importación; el editor en admin llega después.</p>
    </Page>
  );
}
