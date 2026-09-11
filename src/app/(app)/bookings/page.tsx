import Link from "next/link";
import { requireUser } from "@/domains/identity/current-user";
import { bookingsForUser } from "@/domains/services/queries";
import { money } from "@/core/format";
import { BOOKING_STATUS } from "@/domains/bookings/labels";
import { Page, PageHeader } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const user = await requireUser();
  const rows = await bookingsForUser(user.id);
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <Page>
      <PageHeader eyebrow="Mis servicios" title="Lo que has pedido" />
      {rows.length === 0 ? <EmptyState title="Aún no has reservado servicios." cta={{ href: "/services", label: "Explorar servicios" }} /> : (
        <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">
          {rows.map(({ b, service, provider }) => {
            const st = BOOKING_STATUS[b.status] ?? { label: b.status, tone: "neutral" as const };
            return (
              <li key={b.id}>
                <Link href={`/bookings/${b.id}`} className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-surface-2">
                  <span className="min-w-0"><span className="block font-medium truncate">{service.name}</span><span className="block text-sm text-text-2">{provider.businessName} · {fmt.format(b.scheduledAt)} · {money(b.total, b.currency)}</span></span>
                  <Chip tone={st.tone}>{st.label}</Chip>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
