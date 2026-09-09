import { notFound } from "next/navigation";
import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { SEASON_LABEL, WEEK_STATUS } from "@/domains/fractions/labels";
import { formatRange } from "@/core/format";
import { Page, Section } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

/** Pantalla 15: detalle de fracción. Lo contractual vive aquí, separado de la experiencia. */
export default async function FractionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const core = fractionCore();
  const fraction = await core.getFraction(id);
  if (!fraction) notFound();
  const ownership = (await core.getUserOwnerships(user.id)).find((o) => o.fractionId === fraction.id);
  if (!ownership && !user.roles.includes("admin")) notFound();
  const [weeks, history, docs] = await Promise.all([
    core.getFractionWeeks(fraction.id),
    db().query.fractionOwnerships.findMany({ where: eq(schema.fractionOwnerships.fractionId, fraction.id), orderBy: desc(schema.fractionOwnerships.acquiredAt) }),
    db().query.documents.findMany({ where: and(eq(schema.documents.fractionId, fraction.id)), orderBy: asc(schema.documents.createdAt) }),
  ]);
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" });
  return (
    <Page>
      <TopBar back={`/properties/${fraction.propertyId}`} title={`Fracción ${fraction.code}`} />
      <header className="pt-6 fade-up">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted">{fraction.propertyName} · {fraction.destination}</p>
        <h1 className="mt-2 text-[34px] leading-[1.06]">Fracción {fraction.code}</h1>
        <p className="mt-2 text-text-2">{fraction.totalWeeks} semanas al año · {ownership ? `a tu nombre desde ${fmt.format(ownership.acquiredAt)}` : "sin titularidad activa"}</p>
      </header>
      <Section title="Semanas">
        <ul className="flex flex-col gap-2.5">
          {weeks.map((w) => (
            <li key={w.id}>
              <Link href={`/weeks/${w.id}`} className="press flex items-center justify-between rounded-[var(--radius-card)] bg-surface hairline p-4">
                <span><span className="block font-medium">{formatRange(w.startDate, w.endDate)}</span><span className="block text-sm text-text-2">Semana {SEASON_LABEL[w.season]} · {w.year}</span></span>
                <Chip tone={WEEK_STATUS[w.status].tone}>{WEEK_STATUS[w.status].label}</Chip>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Documentación autorizada">
        {docs.length === 0 ? <EmptyState title="Sin documentos cargados todavía." body="Cuando la casa suba tu contrato, reglamento o constancias, aparecen aquí con su hash." /> : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">
            {docs.map((d) => <li key={d.id} className="px-4 py-3"><a href={d.url} className="font-medium underline-offset-4 hover:underline" target="_blank" rel="noreferrer">{d.title}</a><p className="text-[12px] text-muted">{d.kind} · {d.status}</p></li>)}
          </ul>
        )}
      </Section>
      <Section title="Historial de titularidad">
        <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">
          {history.map((h) => (
            <li key={h.id} className="flex items-center justify-between px-4 py-3">
              <span>{fmt.format(h.acquiredAt)}{h.transferredAt ? ` → ${fmt.format(h.transferredAt)}` : ""}</span>
              <Chip tone={h.active ? "success" : "neutral"}>{h.active ? "Activa" : "Cerrada"}</Chip>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] text-muted">La titularidad nunca se sobrescribe: cada cambio queda como una fila cerrada y una nueva.</p>
      </Section>
    </Page>
  );
}
