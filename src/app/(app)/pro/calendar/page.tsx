import { requireRole } from "@/domains/identity/current-user";
import { providerForUser, jobsForProvider } from "@/domains/providers/queries";
import { Page, PageHeader } from "@/ui/page";
import { EmptyState } from "@/ui/empty-state";
import { cn } from "@/ui/cn";

export const dynamic = "force-dynamic";

/** Pantalla 40: calendario del proveedor. Próximos 14 días, carga por día. */
export default async function ProCalendar() {
  const user = await requireRole("provider");
  const prov = await providerForUser(user.id);
  if (!prov) return <Page><PageHeader eyebrow="Disponibilidad" title="Calendario" /><EmptyState title="Aún no tienes perfil de proveedor." cta={{ href: "/pro/onboarding", label: "Crear perfil" }} /></Page>;
  const from = new Date(); from.setHours(0, 0, 0, 0);
  const to = new Date(from); to.setDate(to.getDate() + 14);
  const jobs = await jobsForProvider(prov.id, { from, to });
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(from); d.setDate(d.getDate() + i); return d; });
  const fmtD = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric" });
  return (
    <Page>
      <PageHeader eyebrow="Disponibilidad" title="Próximos 14 días" description="Los bloqueos por día y horario llegan en la siguiente entrega; hoy ves tu carga real." />
      <ul className="grid grid-cols-7 gap-1.5">
        {days.map((d) => { const n = jobs.filter((j) => j.b.scheduledAt.toDateString() === d.toDateString() && j.b.status !== "cancelled").length; return (
          <li key={d.toISOString()} className={cn("flex aspect-square flex-col items-center justify-center rounded-[var(--radius-ctl)] text-[12px] hairline", n > 0 ? "bg-accent-soft text-green-900" : "bg-surface text-text-2")}><span className="capitalize">{fmtD.format(d)}</span>{n > 0 ? <span className="mt-0.5 font-medium">{n}</span> : null}</li>
        ); })}
      </ul>
    </Page>
  );
}
