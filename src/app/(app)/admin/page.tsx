import { count, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { Page, PageHeader } from "@/ui/page";
import { AdminNav } from "@/domains/admin/nav";

export const dynamic = "force-dynamic";

/** Pantalla 49: admin. Funcional, sin prioridad visual. */
export default async function AdminHome() {
  const d = db();
  const [[users], [providersPending], [properties], [incidentsOpen], [bookings], [events]] = await Promise.all([
    d.select({ n: count() }).from(schema.users),
    d.select({ n: count() }).from(schema.providers).where(inArray(schema.providers.status, ["submitted", "under_review"])),
    d.select({ n: count() }).from(schema.properties).where(eq(schema.properties.status, "active")),
    d.select({ n: count() }).from(schema.incidents).where(inArray(schema.incidents.status, ["open", "assigned", "in_progress"])),
    d.select({ n: count() }).from(schema.serviceBookings),
    d.select({ n: count() }).from(schema.domainEvents).where(sql`${schema.domainEvents.publishedAt} is null`),
  ]);
  const tiles = [["Usuarios", users?.n], ["Proveedores por revisar", providersPending?.n], ["Propiedades activas", properties?.n], ["Incidencias abiertas", incidentsOpen?.n], ["Reservas", bookings?.n], ["Eventos sin publicar", events?.n]];
  return (
    <Page wide>
      <PageHeader eyebrow="Administración" title="Resumen" />
      <AdminNav current="/admin" />
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">{tiles.map(([k, v]) => <li key={String(k)} className="rounded-[var(--radius-card)] bg-surface hairline p-4"><p className="text-[12px] text-muted">{k}</p><p className="mt-1 font-serif text-[28px]">{v ?? 0}</p></li>)}</ul>
      <p className="mt-8 text-[12px] text-muted">Eventos de dominio en outbox: listos para Fraction Core, PMS y V&LIVING cuando exista adaptador (INTEGRATIONS.md).</p>
    </Page>
  );
}
