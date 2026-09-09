import Link from "next/link";
import { requireRole } from "@/domains/identity/current-user";
import { incomeForOwner, expensesForOwner, totalsByStatus } from "@/domains/finance/queries";
import { money } from "@/core/format";
import { Page, PageHeader, Section } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" }> = {
  estimated: { label: "Estimado", tone: "neutral" },
  pending: { label: "Pendiente", tone: "warning" },
  confirmed: { label: "Confirmado", tone: "accent" },
  paid: { label: "Pagado", tone: "success" },
};

/** Pantalla 36: ingresos. Elegante, sin parecer Bloomberg. Estimado nunca se mezcla con realizado. */
export default async function IncomePage() {
  const user = await requireRole("owner");
  const [income, expenses] = await Promise.all([incomeForOwner(user.id), expensesForOwner(user.id)]);
  const ti = totalsByStatus(income);
  const te = totalsByStatus(expenses);
  const periods = [...new Set(income.map((i) => i.periodStart.slice(0, 7)))];
  return (
    <Page>
      <PageHeader eyebrow="Ingresos" title="Lo que rinde tu semana" description="Rentas, servicios relacionados y costos, cada uno en su estado. Las estimaciones se muestran aparte y nunca como ingreso." />
      <ul className="grid grid-cols-2 gap-3">
        {(["paid", "confirmed", "pending", "estimated"] as const).map((s) => (
          <li key={s} className="rounded-[var(--radius-card)] bg-surface hairline p-4"><p className="text-[12px] text-muted">{STATUS[s]!.label}</p><p className="mt-1 font-serif text-[24px]">{money(ti[s])}</p>{te[s] > 0 ? <p className="text-[12px] text-muted">costos {money(te[s])}</p> : null}</li>
        ))}
      </ul>
      <Section title="Movimientos">
        {income.length === 0 && expenses.length === 0 ? <EmptyState title="Aún no has liberado semanas para renta." body="Cuando una semana se rente u opere, sus cifras aparecen aquí." cta={{ href: "/weeks", label: "Ver mis semanas" }} /> : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">
            {income.map((i) => <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3"><span className="min-w-0"><span className="block font-medium truncate">{i.description ?? i.source}</span><span className="block text-text-2">{i.periodStart} → {i.periodEnd}{i.isDemo ? " · demo" : ""}</span></span><span className="flex items-center gap-2"><span className="font-medium">{money(i.amount, i.currency)}</span><Chip tone={STATUS[i.status]!.tone}>{STATUS[i.status]!.label}</Chip></span></li>)}
            {expenses.map((e) => <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3"><span className="min-w-0"><span className="block font-medium truncate">{e.description ?? e.category}</span><span className="block text-text-2">{e.incurredOn} · costo</span></span><span className="flex items-center gap-2"><span className="font-medium text-danger">−{money(e.amount, e.currency)}</span><Chip tone={STATUS[e.status]!.tone}>{STATUS[e.status]!.label}</Chip></span></li>)}
          </ul>
        )}
      </Section>
      {periods.length > 0 ? (
        <Section title="Estados de cuenta">
          <ul className="flex flex-wrap gap-2">{periods.map((p) => <li key={p}><Link href={`/income/${p}`} className="press inline-flex min-h-10 items-center rounded-[var(--radius-pill)] bg-surface hairline px-4 text-sm">{p}</Link></li>)}</ul>
        </Section>
      ) : null}
    </Page>
  );
}
