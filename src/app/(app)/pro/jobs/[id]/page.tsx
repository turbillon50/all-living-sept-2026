import { notFound } from "next/navigation";
import { MapPin, Phone } from "@/ui/icons";
import { requireRole } from "@/domains/identity/current-user";
import { jobById } from "@/domains/providers/queries";
import { acceptBooking, rejectBooking, startJob, completeJob } from "@/domains/bookings/actions";
import { maps } from "@/integrations/maps";
import { money } from "@/core/format";
import { BOOKING_STATUS } from "@/domains/bookings/labels";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { Button } from "@/ui/button";

export const dynamic = "force-dynamic";

/** Pantalla 41: detalle de job. Aceptar, rechazar, navegar, iniciar, finalizar con evidencia. */
export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("provider");
  const job = await jobById(id);
  if (!job || job.provider.userId !== user.id) notFound();
  const { b, service, property, requester } = job;
  const st = BOOKING_STATUS[b.status] ?? { label: b.status, tone: "neutral" as const };
  const fmt = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  const nav = property?.lat && property?.lng ? maps().directionsUrl(Number(property.lat), Number(property.lng)) : null;
  return (
    <Page>
      <TopBar back="/pro/jobs" title="Servicio" />
      <header className="pt-4 fade-up">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted capitalize">{fmt.format(b.scheduledAt)}</p>
        <h1 className="mt-2 text-[30px] leading-[1.06]">{service.name}</h1>
        <div className="mt-3 flex items-center gap-2"><Chip tone={st.tone}>{st.label}</Chip><Chip>{b.people} {b.people === 1 ? "persona" : "personas"}</Chip>{b.isDemo ? <Chip>Demo</Chip> : null}</div>
      </header>
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4"><dt className="text-muted">Cliente</dt><dd className="mt-1 font-medium">{requester.name}</dd></div>
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4"><dt className="text-muted">Monto</dt><dd className="mt-1 font-medium">{money(b.total, b.currency)}</dd></div>
        <div className="col-span-2 rounded-[var(--radius-card)] bg-surface hairline p-4"><dt className="text-muted">Dónde</dt><dd className="mt-1 flex items-center gap-2 font-medium"><MapPin size={16} aria-hidden /> {property ? `${property.name} · ${property.city}` : "Por confirmar con el cliente"}</dd>
          {property?.addressPrivate && ["confirmed", "payment_pending", "paid", "in_progress"].includes(b.status) ? <p className="mt-1 text-text-2">{property.addressPrivate}</p> : null}</div>
      </dl>
      {b.options.length ? <p className="mt-3 text-sm text-text-2">Extras: {b.options.map((o) => o.label).join(", ")}</p> : null}
      {b.notes ? <p className="mt-2 text-sm text-text-2">Nota del cliente: {b.notes}</p> : null}

      <div className="mt-8 flex flex-col gap-2.5">
        {b.status === "pending_provider" ? (
          <>
            <form action={acceptBooking}><input type="hidden" name="bookingId" value={b.id} /><Button type="submit" size="lg">Aceptar</Button></form>
            <form action={rejectBooking} className="flex flex-col gap-2"><input type="hidden" name="bookingId" value={b.id} /><input name="reason" placeholder="Motivo (opcional)" className="min-h-11 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-sm" /><Button type="submit" size="lg" variant="secondary">Rechazar</Button></form>
          </>
        ) : null}
        {["confirmed", "paid"].includes(b.status) ? (
          <>
            {nav ? <a href={nav} target="_blank" rel="noreferrer" className="press inline-flex min-h-12 items-center justify-center rounded-[var(--radius-ctl)] bg-surface hairline font-medium">Navegar</a> : null}
            <a href={`/support?booking=${b.id}`} className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-ctl)] bg-surface hairline font-medium"><Phone size={16} aria-hidden /> Contactar por concierge</a>
            <form action={startJob}><input type="hidden" name="bookingId" value={b.id} /><Button type="submit" size="lg">Iniciar servicio</Button></form>
          </>
        ) : null}
        {b.status === "payment_pending" ? <p className="rounded-[var(--radius-card)] bg-accent-soft p-4 text-sm text-green-900">Confirmado. Esperando el pago del cliente para poder iniciar.</p> : null}
        {b.status === "in_progress" ? (
          <form action={completeJob} className="flex flex-col gap-2"><input type="hidden" name="bookingId" value={b.id} /><textarea name="evidenceNote" rows={3} maxLength={500} placeholder="Evidencia: qué se entregó, hora de cierre, observaciones." className="rounded-[var(--radius-ctl)] bg-surface hairline px-4 py-3 text-sm" /><Button type="submit" size="lg">Finalizar y subir evidencia</Button></form>
        ) : null}
        {b.status === "completed" ? <p className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm text-text-2">Completado{typeof b.evidence.note === "string" && b.evidence.note ? ` · ${b.evidence.note}` : ""}.</p> : null}
      </div>
    </Page>
  );
}
