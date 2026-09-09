"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { serviceById } from "@/domains/services/queries";
import { DomainError, conflict, forbidden, notFound } from "@/core/errors";
import { audit, emit } from "@/core/events";
import { notifier } from "@/integrations/notifications";
import { paymentProvider } from "@/integrations/payments";

export type BookingActionState = { ok: boolean; error?: string } | null;
type Status = (typeof schema.bookingStatusEnum.enumValues)[number];

/** Transiciones permitidas. Todo lo demás es conflicto. */
const NEXT: Record<Status, Status[]> = {
  requested: ["pending_provider", "cancelled"],
  pending_provider: ["confirmed", "cancelled"],
  confirmed: ["payment_pending", "in_progress", "cancelled"],
  payment_pending: ["paid", "cancelled"],
  paid: ["in_progress", "cancelled", "refunded"],
  in_progress: ["completed"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

async function transition(bookingId: string, to: Status, actorUserId: string | null, note?: string) {
  const d = db();
  const b = await d.query.serviceBookings.findFirst({ where: eq(schema.serviceBookings.id, bookingId) });
  if (!b) throw notFound("Esa reserva no existe.");
  if (!NEXT[b.status].includes(to)) throw conflict(`No se puede pasar de "${b.status}" a "${to}".`);
  const updated = await d
    .update(schema.serviceBookings)
    .set({ status: to, completedAt: to === "completed" ? new Date() : b.completedAt })
    .where(and(eq(schema.serviceBookings.id, bookingId), eq(schema.serviceBookings.status, b.status)))
    .returning({ id: schema.serviceBookings.id });
  if (updated.length === 0) throw conflict("La reserva cambió mientras se procesaba. Recarga.");
  await d.insert(schema.bookingStatusHistory).values({ bookingId, fromStatus: b.status, toStatus: to, actorUserId, note: note ?? null });
  await audit({ actorUserId, action: `booking.${to}`, entity: "service_bookings", entityId: bookingId, before: { status: b.status }, after: { status: to } });
  return b;
}

const requestSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  people: z.coerce.number().int().min(1).max(50),
  stayId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

/** Pantalla 32: solicitar reserva. Crea el booking en requested → pending_provider y avisa al proveedor. */
export async function requestBooking(_prev: BookingActionState, form: FormData): Promise<BookingActionState> {
  const user = await requireUser();
  const parsed = requestSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const d = parsed.data;
  const optionKeys = form.getAll("option").map(String);
  const svc = await serviceById(d.serviceId);
  if (!svc || !svc.service.active || svc.provider.status !== "approved") return { ok: false, error: "Este servicio no está disponible." };
  if (svc.service.maxPeople && d.people > svc.service.maxPeople) return { ok: false, error: `Este servicio admite hasta ${svc.service.maxPeople} personas.` };
  const scheduledAt = new Date(`${d.date}T${d.time}:00-06:00`);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) return { ok: false, error: "Elige una fecha y hora futuras." };

  const chosen = svc.service.options.filter((o) => optionKeys.includes(o.key));
  const perUnit = svc.service.priceFrom ? Number(svc.service.priceFrom) : 0;
  const isPerPerson = svc.service.unit === "persona";
  const subtotal = (isPerPerson ? perUnit * d.people : perUnit) + chosen.reduce((s, o) => s + (isPerPerson ? o.price * d.people : o.price), 0);
  const fees = 0; // Sin fees de plataforma hasta que Luis los defina.
  const total = subtotal + fees;

  let stayId: string | null = null;
  let propertyId: string | null = null;
  if (d.stayId) {
    const stay = await db().query.stays.findFirst({ where: eq(schema.stays.id, d.stayId) });
    if (stay) {
      const guest = await db().query.stayGuests.findFirst({ where: and(eq(schema.stayGuests.stayId, stay.id), eq(schema.stayGuests.userId, user.id)) });
      const allowed = stay.hostUserId === user.id || Boolean(guest?.permissions?.can_book_services);
      if (!allowed) return { ok: false, error: "No tienes permiso para reservar en esta estancia." };
      stayId = stay.id;
      propertyId = stay.propertyId;
    }
  }

  let bookingId: string;
  try {
    const [row] = await db()
      .insert(schema.serviceBookings)
      .values({ serviceId: svc.service.id, providerId: svc.provider.id, requesterUserId: user.id, stayId, propertyId, scheduledAt, people: d.people, options: chosen, notes: d.notes || null, subtotal: String(subtotal), fees: String(fees), total: String(total), currency: svc.service.currency, status: "requested" })
      .returning({ id: schema.serviceBookings.id });
    if (!row) throw conflict("No se pudo crear la reserva.");
    bookingId = row.id;
    await db().insert(schema.bookingStatusHistory).values({ bookingId, fromStatus: null, toStatus: "requested", actorUserId: user.id });
    await transition(bookingId, "pending_provider", user.id);
    await emit("service.requested", "service_booking", bookingId, { serviceId: svc.service.id, providerId: svc.provider.id });
    await notifier().send({ userId: svc.provider.userId, type: "booking", title: "Nueva solicitud de servicio", body: `${svc.service.name} · ${d.people} personas`, deepLink: `/pro/jobs/${bookingId}` });
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, error: e.message };
    throw e;
  }
  revalidatePath("/bookings");
  redirect(`/bookings/${bookingId}?requested=1`);
}

async function providerOwns(bookingId: string, userId: string) {
  const b = await db().query.serviceBookings.findFirst({ where: eq(schema.serviceBookings.id, bookingId) });
  if (!b) throw notFound("Esa reserva no existe.");
  const p = await db().query.providers.findFirst({ where: eq(schema.providers.id, b.providerId) });
  if (!p || p.userId !== userId) throw forbidden("Esta reserva no es tuya.");
  return { b, p };
}

/** Proveedor acepta: confirmed y pasa a pago pendiente. */
export async function acceptBooking(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("bookingId") ?? "");
  const { b } = await providerOwns(id, user.id);
  await transition(id, "confirmed", user.id);
  if (Number(b.total) > 0) await transition(id, "payment_pending", null, "auto");
  await emit("service.confirmed", "service_booking", id, {});
  await notifier().send({ userId: b.requesterUserId, type: "service", title: "Tu servicio fue confirmado", body: Number(b.total) > 0 ? "Completa el pago para dejarlo cerrado." : "Todo listo.", deepLink: `/bookings/${id}` });
  revalidatePath(`/pro/jobs/${id}`);
  redirect(`/pro/jobs/${id}`);
}

export async function rejectBooking(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("bookingId") ?? "");
  const { b } = await providerOwns(id, user.id);
  await transition(id, "cancelled", user.id, String(form.get("reason") ?? "rechazado por proveedor"));
  await notifier().send({ userId: b.requesterUserId, type: "service", title: "El proveedor no puede tomar tu servicio", body: "Busca otra opción; concierge puede ayudarte.", deepLink: `/services` });
  revalidatePath("/pro");
  redirect("/pro");
}

export async function startJob(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("bookingId") ?? "");
  await providerOwns(id, user.id);
  await transition(id, "in_progress", user.id);
  revalidatePath(`/pro/jobs/${id}`);
  redirect(`/pro/jobs/${id}`);
}

export async function completeJob(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("bookingId") ?? "");
  const { b } = await providerOwns(id, user.id);
  const note = String(form.get("evidenceNote") ?? "").slice(0, 500);
  await db().update(schema.serviceBookings).set({ evidence: { note, at: new Date().toISOString() } }).where(eq(schema.serviceBookings.id, id));
  await transition(id, "completed", user.id, note || undefined);
  await emit("service.completed", "service_booking", id, {});
  await notifier().send({ userId: b.requesterUserId, type: "service", title: "Servicio completado", body: "Cuéntanos cómo estuvo cuando quieras.", deepLink: `/bookings/${id}` });
  revalidatePath(`/pro/jobs/${id}`);
  redirect(`/pro/jobs/${id}`);
}

/** Pago del solicitante vía PaymentProvider. Con adaptador local queda registrado como DEMO: nunca mueve dinero. */
export async function payBooking(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("bookingId") ?? "");
  const b = await db().query.serviceBookings.findFirst({ where: eq(schema.serviceBookings.id, id) });
  if (!b) throw notFound();
  if (b.requesterUserId !== user.id) throw forbidden();
  if (b.status !== "payment_pending") redirect(`/bookings/${id}`);
  const pp = paymentProvider();
  const r = await pp.createPayment({ bookingId: id, payerUserId: user.id, amount: Number(b.total), currency: b.currency, description: `Reserva ${id}` });
  await db().insert(schema.payments).values({
    bookingId: id,
    payerUserId: user.id,
    provider: r.provider,
    providerRef: r.status === "failed" ? null : r.providerRef,
    amount: b.total,
    currency: b.currency,
    status: r.status === "succeeded" ? "succeeded" : r.status === "pending" ? "pending" : "failed",
    method: pp.isLocal ? "demo" : "card",
    isDemo: r.demo,
  });
  if (r.status === "succeeded") {
    await transition(id, "paid", user.id, r.demo ? "pago demo (adaptador local)" : undefined);
    await emit("payment.completed", "service_booking", id, { provider: r.provider, demo: r.demo });
  }
  revalidatePath(`/bookings/${id}`);
  redirect(`/bookings/${id}${r.status === "failed" ? "?payment=failed" : ""}`);
}

export async function cancelBooking(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("bookingId") ?? "");
  const b = await db().query.serviceBookings.findFirst({ where: eq(schema.serviceBookings.id, id) });
  if (!b || b.requesterUserId !== user.id) throw forbidden();
  await transition(id, "cancelled", user.id, "cancelado por el solicitante");
  revalidatePath(`/bookings/${id}`);
  redirect(`/bookings/${id}`);
}
