import { requireUser } from "@/domains/identity/current-user";
import { staysForUser } from "@/domains/stays/queries";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { IncidentForm } from "./incident-form";

export const dynamic = "force-dynamic";

/** Pantalla 44: crear incidencia. */
export default async function NewIncident({ searchParams }: { searchParams: Promise<{ stay?: string; type?: string }> }) {
  const { stay, type } = await searchParams;
  const user = await requireUser();
  const [stays, ownerships] = await Promise.all([staysForUser(user.id), fractionCore().getUserOwnerships(user.id)]);
  const targets = [
    ...stays.filter((s) => s.status !== "completed" && s.status !== "cancelled").map((s) => ({ key: `stay:${s.id}`, propertyId: s.propertyId, stayId: s.id, label: `${s.propertyName} · estancia ${formatRange(s.startDate, s.endDate)}` })),
    ...ownerships.map((o) => ({ key: `prop:${o.propertyId}`, propertyId: o.propertyId, stayId: "", label: `${o.propertyName} · fracción ${o.fractionCode}` })),
  ];
  const unique = targets.filter((t, i, a) => a.findIndex((x) => x.key === t.key) === i);
  return (
    <Page>
      <TopBar back="/support" title="Reportar" />
      <header className="pt-4 fade-up"><h1 className="text-[32px] leading-[1.06]">{type === "urgencia" ? "Urgencia operativa" : "Cuéntanos qué pasa"}</h1><p className="mt-2 text-text-2">{type === "urgencia" ? "Prioridad inmediata. Operación recibe el aviso al instante." : "Lo recibe operación y te vamos contando."}</p></header>
      <IncidentForm targets={unique} defaultKey={stay ? `stay:${stay}` : unique[0]?.key ?? ""} defaultType={type ?? "propiedad"} />
    </Page>
  );
}
