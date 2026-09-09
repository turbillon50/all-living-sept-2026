import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { BOOKING_STATUS } from "@/domains/bookings/labels";
import { money } from "@/core/format";
import { Page, PageHeader } from "@/ui/page";
import { AdminNav } from "@/domains/admin/nav";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

export default async function AdminBookings() {
  const rows = await db().select({ b: schema.serviceBookings, service: schema.providerServices, provider: schema.providers, requester: schema.users }).from(schema.serviceBookings).innerJoin(schema.providerServices, eq(schema.providerServices.id, schema.serviceBookings.serviceId)).innerJoin(schema.providers, eq(schema.providers.id, schema.serviceBookings.providerId)).innerJoin(schema.users, eq(schema.users.id, schema.serviceBookings.requesterUserId)).orderBy(desc(schema.serviceBookings.scheduledAt)).limit(100);
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <Page wide>
      <PageHeader eyebrow="Administración" title="Reservas" />
      <AdminNav current="/admin/bookings" />
      <ul className="mt-6 divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">{rows.map(({ b, service, provider, requester }) => <li key={b.id}><Link href={`/bookings/${b.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2"><span className="min-w-0"><span className="block font-medium">{fmt.format(b.scheduledAt)} · {service.name}</span><span className="block text-text-2 truncate">{provider.businessName} → {requester.name} · {money(b.total, b.currency)}{b.isDemo ? " · demo" : ""}</span></span><Chip tone={BOOKING_STATUS[b.status]!.tone}>{BOOKING_STATUS[b.status]!.label}</Chip></Link></li>)}</ul>
    </Page>
  );
}
