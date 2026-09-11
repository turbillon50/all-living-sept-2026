import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { money } from "@/core/format";
import { BOOKING_STATUS } from "@/domains/bookings/labels";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { Photo } from "@/ui/photo";
import { Button, ButtonLink } from "@/ui/button";
import { cancelBooking, payBooking } from "@/domains/bookings/actions";

export const dynamic = "force-dynamic";

/** Pantalla 33: confirmación / detalle de una reserva de servicio. */
export default async function BookingDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ requested?: string; payment?: string }> }) {
  const { id } = await params;
  const { requested, payment } = await searchParams;
  const user = await requireUser();
  const d = db();
  const row = (
    await d
      .select({ b: schema.serviceBookings, service: schema.providerServices, provider: schema.providers })
      .from(schema.serviceBookings)
      .innerJoin(schema.providerServices, eq(schema.providerServices.id, schema.serviceBookings.serviceId))
      .innerJoin(schema.providers, eq(schema.providers.id, schema.serviceBookings.providerId))
      .where(eq(schema.serviceBookings.id, id))
      .limit(1)
  )[0];
  if (!row) notFound();
  const isRequester = row.b.requesterUserId === user.id;
  const isProvider = row.provider.userId === user.id;
  if (!isRequester && !isProvider && !user.roles.includes("operator") && !user.roles.includes("admin")) notFound();
  const history = await d.query.bookingStatusHistory.findMany({ where: eq(schema.bookingStatusHistory.bookingId, id), orderBy: asc(schema.bookingStatusHistory.createdAt) });
  const st = BOOKING_STATUS[row.b.status] ?? { label: row.b.status, tone: "neutral" as const };
  const fmt = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  return (
    <Page>
      <TopBar back={row.b.stayId ? `/stays/${row.b.stayId}` : isProvider ? "/pro" : "/home"} title="Reserva" />
      {requested ? <div role="status" className="mt-4 rounded-[var(--radius-card)] bg-accent-soft px-4 py-3 text-sm text-green-900">Solicitud enviada. El proveedor confirma y te avisamos.</div> : null}
      {payment === "failed" ? <div role="alert" className="mt-4 rounded-[var(--radius-card)] bg-[#f7e6e4] px-4 py-3 text-sm text-danger">El pago no se completó. Intenta de nuevo o cambia de método.</div> : null}
      {row.service.coverUrl ? <Photo src={row.service.coverUrl} alt={row.service.name} className="mt-2" sizes="(max-width: 768px) 100vw, 672px" /> : null}
      <header className="mt-5 flex items-start justify-between gap-3">
        <div><h1 className="text-[28px] leading-[1.08]">{row.service.name}</h1><p className="mt-1 text-text-2">{row.provider.businessName}{row.provider.status === "approved" ? " · All Living Verified" : ""}</p></div>
        <Chip tone={st.tone}>{st.label}</Chip>
      </header>
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4"><dt className="text-muted">Cuándo</dt><dd className="mt-1 font-medium capitalize">{fmt.format(row.b.scheduledAt)}</dd></div>
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4"><dt className="text-muted">Personas</dt><dd className="mt-1 font-medium">{row.b.people}</dd></div>
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4 col-span-2"><dt className="text-muted">Total</dt><dd className="mt-1 font-serif text-[24px]">{money(row.b.total, row.b.currency)}{row.b.isDemo ? <span className="ml-2 align-middle text-[11px] font-sans tracking-[0.2em] uppercase text-muted">demo</span> : null}</dd>
          {Number(row.b.fees) > 0 ? <p className="text-[12px] text-muted">Incluye {money(row.b.fees, row.b.currency)} de fees.</p> : null}</div>
      </dl>
      {row.b.notes ? <p className="mt-4 text-sm text-text-2">Nota: {row.b.notes}</p> : null}
      {row.service.cancellationPolicy ? <p className="mt-3 text-[13px] text-muted">{row.service.cancellationPolicy}</p> : null}
      <section className="mt-8">
        <p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Historial</p>
        <ol className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline text-sm">
          {history.map((h) => <li key={h.id} className="flex justify-between px-4 py-2.5"><span>{BOOKING_STATUS[h.toStatus]?.label ?? h.toStatus}</span><span className="text-muted">{new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(h.createdAt)}</span></li>)}
        </ol>
      </section>
      {isRequester && row.b.status === "payment_pending" ? (
        <form action={payBooking} className="mt-8 flex flex-col gap-2"><input type="hidden" name="bookingId" value={row.b.id} /><Button type="submit" size="lg">Pagar {money(row.b.total, row.b.currency)}</Button><p className="text-center text-[12px] text-muted">Sin pasarela conectada, el pago se registra como demo y no mueve dinero.</p></form>
      ) : null}
      {isRequester && ["requested", "pending_provider", "confirmed", "payment_pending"].includes(row.b.status) ? (
        <form action={cancelBooking} className="mt-3"><input type="hidden" name="bookingId" value={row.b.id} /><Button type="submit" variant="ghost" size="sm" className="w-full text-danger">Cancelar solicitud</Button></form>
      ) : null}
      {isProvider ? <div className="mt-8"><ButtonLink href={`/pro/jobs/${row.b.id}`} variant="secondary">Gestionar como proveedor</ButtonLink></div> : null}
    </Page>
  );
}
