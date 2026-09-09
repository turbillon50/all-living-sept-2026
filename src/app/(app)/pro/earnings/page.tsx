import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireRole } from "@/domains/identity/current-user";
import { providerForUser, jobsForProvider } from "@/domains/providers/queries";
import { money } from "@/core/format";
import { Page, PageHeader, Section } from "@/ui/page";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

/** Pantalla 42: ingresos del proveedor. Confirmado, completado y pagado, por separado. */
export default async function ProEarnings() {
  const user = await requireRole("provider");
  const prov = await providerForUser(user.id);
  if (!prov) return <Page><PageHeader eyebrow="Ingresos" title="Ingresos" /><EmptyState title="Aún no tienes perfil de proveedor." cta={{ href: "/pro/onboarding", label: "Crear perfil" }} /></Page>;
  const [jobs, payouts] = await Promise.all([jobsForProvider(prov.id), db().query.payouts.findMany({ where: eq(schema.payouts.providerId, prov.id), orderBy: asc(schema.payouts.periodStart) })]);
  const sum = (statuses: string[]) => jobs.filter((j) => statuses.includes(j.b.status)).reduce((s, j) => s + Number(j.b.total), 0);
  const tiles = [
    { k: "Confirmado", v: sum(["confirmed", "payment_pending"]), note: "aceptado, pendiente de ejecutar" },
    { k: "Completado", v: sum(["completed"]), note: "servicios entregados" },
    { k: "Pagado al cliente", v: sum(["paid", "in_progress"]), note: "cobrado por All Living" },
    { k: "Liquidado a ti", v: payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0), note: "transferido" },
  ];
  return (
    <Page>
      <PageHeader eyebrow="Ingresos" title="Tus números" description="Cada cifra dice de dónde viene. Nada estimado se mezcla con lo realizado." />
      <ul className="grid grid-cols-2 gap-3">{tiles.map((t) => <li key={t.k} className="rounded-[var(--radius-card)] bg-surface hairline p-4"><p className="text-[12px] text-muted">{t.k}</p><p className="mt-1 font-serif text-[24px]">{money(t.v)}</p><p className="text-[12px] text-muted">{t.note}</p></li>)}</ul>
      <Section title="Liquidaciones">
        {payouts.length === 0 ? <EmptyState title="Sin liquidaciones todavía." body="Se generan por periodo cuando hay servicios completados y cobrados." /> : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{payouts.map((p) => <li key={p.id} className="flex justify-between px-4 py-3"><span>{p.periodStart.toLocaleDateString("es-MX")} – {p.periodEnd.toLocaleDateString("es-MX")}</span><span className="font-medium">{money(p.amount, p.currency)} · {p.status}</span></li>)}</ul>
        )}
      </Section>
    </Page>
  );
}
