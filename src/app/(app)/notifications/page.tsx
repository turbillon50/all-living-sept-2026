import { desc, eq } from "drizzle-orm";
import { CalendarDays, Sparkles, Wallet, KeyRound, Briefcase, Wrench, MessageCircle, Info, Bell } from "@/ui/icons";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { Page, PageHeader } from "@/ui/page";
import { EmptyState } from "@/ui/empty-state";
import { FilterPills, ListRow, RowGroup } from "@/ui/primitives";

export const dynamic = "force-dynamic";

const ICON = { stay: CalendarDays, booking: Sparkles, service: Sparkles, payment: Wallet, access: KeyRound, provider: Briefcase, maintenance: Wrench, message: MessageCircle, system: Info } as const;
const FILTERS = [["all", "Todas"], ["stay", "Estancias"], ["service", "Servicios"], ["payment", "Pagos"]] as const;

function ago(d: Date) {
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const days = Math.round(h / 24);
  return `Hace ${days} ${days === 1 ? "día" : "días"}`;
}

/** Pantalla 35: notificaciones. Filtros, icono por tipo, deep link al objeto real. */
export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "all" } = await searchParams;
  const user = await requireUser();
  const rows = await db().query.notifications.findMany({ where: eq(schema.notifications.userId, user.id), orderBy: desc(schema.notifications.createdAt), limit: 60 });
  const shown = rows.filter((n) => f === "all" || n.type === f || (f === "service" && n.type === "booking"));
  return (
    <Page>
      <PageHeader eyebrow="Notificaciones" title="Notificaciones" />
      <FilterPills current={f} items={FILTERS.map(([k, l]) => ({ key: k, label: l, href: k === "all" ? "/notifications" : `/notifications?f=${k}` }))} />
      <div className="mt-5">
        {shown.length === 0 ? <EmptyState title="Nada nuevo por ahora." /> : (
          <RowGroup>{shown.map((n) => <ListRow key={n.id} href={n.deepLink ?? "/notifications"} Icon={ICON[n.type] ?? Bell} title={n.title} subtitle={`${n.body ? n.body + " · " : ""}${ago(n.createdAt)}`} />)}</RowGroup>
        )}
      </div>
    </Page>
  );
}
