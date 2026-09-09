import Link from "next/link";
import { Home, Sparkles, MoreHorizontal } from "lucide-react";
import { requireRole } from "@/domains/identity/current-user";
import { incomeForOwner, expensesForOwner, totalsByStatus } from "@/domains/finance/queries";
import { money } from "@/core/format";
import { Page, PageHeader, Section } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";
import { ButtonLink } from "@/ui/button";
import { ListRow, RowGroup } from "@/ui/primitives";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" }> = { estimated: { label: "Estimado", tone: "neutral" }, pending: { label: "Pendiente", tone: "warning" }, confirmed: { label: "Confirmado", tone: "accent" }, paid: { label: "Pagado", tone: "success" } };

/** Pantalla 36: ingresos. Cifra grande solo con lo realizado; estimados aparte. Barras solo con datos reales. */
export default async function IncomePage() {
  const user = await requireRole("owner");
  const [income, expenses] = await Promise.all([incomeForOwner(user.id), expensesForOwner(user.id)]);
  const ti = totalsByStatus(income);
  const te = totalsByStatus(expenses);
  const realized = ti.paid + ti.confirmed;
  const bySource = { rental: 0, service: 0, other: 0 };
  for (const i of income) if (i.status === "paid" || i.status === "confirmed") bySource[i.source] += Number(i.amount);
  const months = new Map<string, number>();
  for (const i of income) if (i.status === "paid" || i.status === "confirmed") months.set(i.periodStart.slice(0, 7), (months.get(i.periodStart.slice(0, 7)) ?? 0) + Number(i.amount));
  const series = [...months.entries()].sort().slice(-6);
  const max = Math.max(1, ...series.map(([, v]) => v));
  const periods = [...new Set(income.map((i) => i.periodStart.slice(0, 7)))];
  return (
    <Page>
      <PageHeader eyebrow="Ingresos" title="Ingresos" action={<Chip>Últimos 12 meses</Chip>} />
      <section className="rounded-[var(--radius-card)] bg-surface hairline p-5">
        <p className="text-[12px] text-muted">Realizado (confirmado + pagado)</p>
        <p className="mt-1 font-serif text-[36px] leading-none">{money(realized)}</p>
        {ti.estimated > 0 || ti.pending > 0 ? <p className="mt-2 text-[12px] text-text-2">Aparte: {money(ti.estimated)} estimado · {money(ti.pending)} pendiente. No se suman.</p> : null}
        {series.length > 0 ? (
          <div className="mt-5 flex h-24 items-end gap-2" aria-label="Ingresos realizados por mes">
            {series.map(([m, v]) => <div key={m} className="flex flex-1 flex-col items-center gap-1.5"><div className="w-full rounded-t-[6px] bg-green-900/80" style={{ height: `${Math.max(6, (v / max) * 80)}px` }} title={money(v)} /><span className="text-[10px] text-muted">{new Intl.DateTimeFormat("es-MX", { month: "short" }).format(new Date(`${m}-15T12:00:00Z`))}</span></div>)}
          </div>
        ) : <p className="mt-4 text-[12px] text-muted">Sin ingresos realizados todavía: la gráfica aparece con datos reales.</p>}
      </section>
      <Section>
        <RowGroup>
          <ListRow Icon={Home} title="Rentas" right={<span className="text-[15px] font-medium">{money(bySource.rental)}</span>} />
          <ListRow Icon={Sparkles} title="Servicios" right={<span className="text-[15px] font-medium">{money(bySource.service)}</span>} />
          <ListRow Icon={MoreHorizontal} title="Otros" right={<span className="text-[15px] font-medium">{money(bySource.other)}</span>} />
        </RowGroup>
        {te.paid + te.confirmed > 0 ? <p className="mt-2 text-[12px] text-muted">Costos confirmados y pagados: {money(te.paid + te.confirmed)}.</p> : null}
      </Section>
      <Section title="Movimientos">
        {income.length === 0 && expenses.length === 0 ? <EmptyState title="Aún no has liberado semanas para renta." cta={{ href: "/weeks", label: "Ver mis semanas" }} /> : (
          <RowGroup>
            {income.map((i) => <ListRow key={i.id} title={i.description ?? i.source} subtitle={`${i.periodStart} → ${i.periodEnd}${i.isDemo ? " · demo" : ""}`} right={<span className="flex items-center gap-2"><span className="text-[14px] font-medium">{money(i.amount, i.currency)}</span><Chip tone={STATUS[i.status]!.tone}>{STATUS[i.status]!.label}</Chip></span>} />)}
            {expenses.map((e) => <ListRow key={e.id} title={e.description ?? e.category} subtitle={`${e.incurredOn} · costo`} right={<span className="flex items-center gap-2"><span className="text-[14px] font-medium text-danger">−{money(e.amount, e.currency)}</span><Chip tone={STATUS[e.status]!.tone}>{STATUS[e.status]!.label}</Chip></span>} />)}
          </RowGroup>
        )}
      </Section>
      {periods[0] ? <div className="mt-6"><ButtonLink href={`/income/${periods[0]}`} size="lg" variant="secondary">Ver estado de cuenta</ButtonLink></div> : null}
      {periods.length > 1 ? <p className="mt-3 text-center text-[12px] text-muted">{periods.slice(1).map((p) => <Link key={p} href={`/income/${p}`} className="mx-1 underline underline-offset-4">{p}</Link>)}</p> : null}
    </Page>
  );
}
