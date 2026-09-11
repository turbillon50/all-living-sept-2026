import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { INCIDENT_STATUS } from "@/domains/operations/labels";

export const dynamic = "force-dynamic";


/** Pantalla 45: detalle de incidencia (lado usuario). */
export default async function IncidentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const inc = await db().query.incidents.findFirst({ where: eq(schema.incidents.id, id) });
  if (!inc) notFound();
  if (inc.reporterUserId !== user.id && !user.roles.includes("operator") && !user.roles.includes("admin")) notFound();
  const property = await db().query.properties.findFirst({ where: eq(schema.properties.id, inc.propertyId) });
  const st = INCIDENT_STATUS[inc.status] ?? INCIDENT_STATUS.open!;
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <Page>
      <TopBar back="/support" title="Incidencia" />
      <header className="pt-4 fade-up"><p className="text-[11px] tracking-[0.24em] uppercase text-muted">{property?.name} · {fmt.format(inc.createdAt)}</p><h1 className="mt-2 text-[28px] leading-[1.08] capitalize">{inc.type}</h1><div className="mt-3 flex gap-2"><Chip tone={st.tone}>{st.label}</Chip><Chip tone={inc.priority === "urgent" ? "danger" : "neutral"}>{inc.priority}</Chip></div></header>
      <p className="mt-6 rounded-[var(--radius-card)] bg-surface hairline p-4 text-[15px] leading-relaxed">{inc.description}</p>
      {inc.resolutionNote ? <div className="mt-4 rounded-[var(--radius-card)] bg-accent-soft p-4 text-sm text-green-900"><p className="text-[11px] tracking-[0.24em] uppercase">Respuesta de operación</p><p className="mt-1">{inc.resolutionNote}</p></div> : null}
      <p className="mt-6 text-[12px] text-muted">Te avisamos en cada cambio de estado.</p>
    </Page>
  );
}
