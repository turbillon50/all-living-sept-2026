import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { paymentProvider } from "@/integrations/payments";
import { money } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { EmptyState } from "@/ui/empty-state";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

/** Pantalla 48: pagos. Métodos cuando exista pasarela; historial real siempre. */
export default async function PaymentsPage() {
  const user = await requireUser();
  const pp = paymentProvider();
  const rows = await db().query.payments.findMany({ where: eq(schema.payments.payerUserId, user.id), orderBy: desc(schema.payments.createdAt), limit: 30 });
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" });
  return (
    <Page>
      <TopBar back="/profile" title="Pagos" />
      <section className="mt-6 rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm">
        <p className="font-medium">Métodos de pago</p>
        <p className="mt-1 text-text-2">{pp.isLocal ? "Sin pasarela conectada todavía. Cuando se active Stripe, aquí guardas tus tarjetas." : `Pasarela: ${pp.name}`}</p>
      </section>
      <section className="mt-8">
        <p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Historial</p>
        {rows.length === 0 ? <EmptyState title="Sin pagos registrados." /> : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{rows.map((p) => <li key={p.id} className="flex items-center justify-between px-4 py-3"><span>{fmt.format(p.createdAt)} · {money(p.amount, p.currency)}</span><span className="flex gap-1.5">{p.isDemo ? <Chip>Demo</Chip> : null}<Chip tone={p.status === "succeeded" ? "success" : p.status === "failed" ? "danger" : "neutral"}>{p.status}</Chip></span></li>)}</ul>
        )}
      </section>
    </Page>
  );
}
