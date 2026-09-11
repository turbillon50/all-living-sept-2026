import { notFound } from "next/navigation";
import { requireRole } from "@/domains/identity/current-user";
import { statementFor, totalsByStatus } from "@/domains/finance/queries";
import { money } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";

export const dynamic = "force-dynamic";

/** Pantalla 37: estado de cuenta del periodo. Realizado y estimado en bloques separados. */
export default async function StatementPage({ params }: { params: Promise<{ period: string }> }) {
  const { period } = await params;
  const user = await requireRole("owner");
  const st = await statementFor(user.id, period);
  if (!st) notFound();
  const ti = totalsByStatus(st.income);
  const te = totalsByStatus(st.expenses);
  const realizado = ti.paid + ti.confirmed - te.paid - te.confirmed;
  const label = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(`${st.start}T12:00:00Z`));
  return (
    <Page>
      <TopBar back="/income" title="Estado de cuenta" />
      <header className="pt-4 fade-up"><p className="text-[11px] tracking-[0.24em] uppercase text-muted capitalize">{label}</p><h1 className="mt-2 text-[32px] leading-[1.06]">{user.name}</h1><p className="mt-1 text-sm text-text-2">Member {user.memberId} · {st.start} → {st.end}</p></header>
      <section className="mt-8 rounded-[var(--radius-panel)] bg-green-950 p-6 text-ivory">
        <p className="text-[11px] tracking-[0.3em] uppercase text-ivory/60">Resultado realizado</p>
        <p className="mt-2 font-serif text-[36px]">{money(realizado)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-ivory/60">Ingresos confirmados y pagados</p><p className="font-medium">{money(ti.paid + ti.confirmed)}</p></div><div><p className="text-ivory/60">Costos confirmados y pagados</p><p className="font-medium">{money(te.paid + te.confirmed)}</p></div></div>
      </section>
      {(ti.estimated > 0 || ti.pending > 0) ? (
        <section className="mt-4 rounded-[var(--radius-card)] bg-surface hairline p-5"><p className="text-[11px] tracking-[0.24em] uppercase text-muted">Aparte · no realizado</p><div className="mt-2 grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted">Estimado</p><p className="font-medium">{money(ti.estimated)}</p></div><div><p className="text-muted">Pendiente</p><p className="font-medium">{money(ti.pending)}</p></div></div></section>
      ) : null}
      <section className="mt-8">
        <p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Detalle</p>
        <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">
          {st.income.map((i) => <li key={i.id} className="flex justify-between px-4 py-3"><span>{i.description ?? i.source} · {i.status}</span><span className="font-medium">{money(i.amount, i.currency)}</span></li>)}
          {st.expenses.map((e) => <li key={e.id} className="flex justify-between px-4 py-3"><span>{e.description ?? e.category} · {e.status}</span><span className="font-medium text-danger">−{money(e.amount, e.currency)}</span></li>)}
          {st.income.length + st.expenses.length === 0 ? <li className="px-4 py-3 text-text-2">Sin movimientos en este periodo.</li> : null}
        </ul>
      </section>
    </Page>
  );
}
