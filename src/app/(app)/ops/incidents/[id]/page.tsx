import { notFound } from "next/navigation";
import { requireRole } from "@/domains/identity/current-user";
import { incidentById } from "@/domains/operations/queries";
import { updateIncident } from "@/domains/operations/actions";
import { INCIDENT_STATUS, PRIORITY } from "@/domains/operations/labels";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { Button } from "@/ui/button";

export const dynamic = "force-dynamic";

const NEXT: Record<string, Array<[string, string]>> = {
  open: [["assigned", "Tomarla"], ["in_progress", "Empezar"], ["closed", "Cerrar sin acción"]],
  assigned: [["in_progress", "Empezar"], ["open", "Soltarla"]],
  in_progress: [["resolved", "Marcar resuelta"]],
  resolved: [["closed", "Cerrar"], ["in_progress", "Reabrir"]],
  closed: [],
};

export default async function OpsIncident({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("operator");
  const row = await incidentById(id);
  if (!row) notFound();
  const { inc, property, reporter } = row;
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <Page>
      <TopBar back="/ops/tasks" title="Incidencia" />
      <header className="pt-4"><p className="text-[11px] tracking-[0.24em] uppercase text-muted">{property.name} · {fmt.format(inc.createdAt)} · {reporter.name}</p><h1 className="mt-2 text-[28px] leading-[1.08] capitalize">{inc.type}</h1><div className="mt-3 flex gap-2"><Chip tone={PRIORITY[inc.priority]!.tone}>{PRIORITY[inc.priority]!.label}</Chip><Chip tone={INCIDENT_STATUS[inc.status]!.tone}>{INCIDENT_STATUS[inc.status]!.label}</Chip></div></header>
      <p className="mt-6 rounded-[var(--radius-card)] bg-surface hairline p-4 text-[15px] leading-relaxed">{inc.description}</p>
      {inc.resolutionNote ? <p className="mt-3 text-sm text-text-2">Nota: {inc.resolutionNote}</p> : null}
      <form action={updateIncident} className="mt-8 flex flex-col gap-3">
        <input type="hidden" name="incidentId" value={inc.id} />
        <textarea name="note" rows={3} maxLength={500} placeholder="Nota para el usuario (opcional)" className="rounded-[var(--radius-ctl)] bg-surface hairline px-4 py-3 text-sm" />
        <div className="flex flex-wrap gap-2">{(NEXT[inc.status] ?? []).map(([s, l]) => <Button key={s} type="submit" name="status" value={s} variant={s === "resolved" || s === "in_progress" || s === "assigned" ? "primary" : "secondary"} size="sm">{l}</Button>)}</div>
      </form>
    </Page>
  );
}
