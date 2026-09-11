"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { DomainError, forbidden, notFound } from "@/core/errors";
import { audit, emit } from "@/core/events";
import { notifier } from "@/integrations/notifications";

export type StayActionState = { ok: boolean; error?: string; inviteUrl?: string } | null;

async function hostStay(stayId: string, userId: string) {
  const stay = await db().query.stays.findFirst({ where: eq(schema.stays.id, stayId) });
  if (!stay) throw notFound("Esa estancia no existe.");
  if (stay.hostUserId !== userId) throw forbidden("Solo el anfitrión puede hacer esto.");
  return stay;
}

const prepSchema = z.object({
  stayId: z.string().uuid(),
  arrivalMode: z.enum(["vuelo", "auto", "otro"]).optional(),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  flight: z.string().max(40).optional().or(z.literal("")),
  pickup: z.string().optional(),
  grocery: z.string().optional(),
  chef: z.string().optional(),
  crib: z.string().optional(),
  nanny: z.string().optional(),
  celebration: z.string().max(200).optional().or(z.literal("")),
});

/** Pantalla 23: preparar estancia. Guarda las respuestas y avisa a concierge. */
export async function prepareStay(_prev: StayActionState, form: FormData): Promise<StayActionState> {
  const user = await requireUser();
  const parsed = prepSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const d = parsed.data;
  try {
    const stay = await hostStay(d.stayId, user.id);
    const preparation = {
      ...(stay.preparation as Record<string, unknown>),
      pickup: d.pickup === "on",
      grocery: d.grocery === "on",
      chef: d.chef === "on",
      crib: d.crib === "on",
      nanny: d.nanny === "on",
      celebration: d.celebration || null,
      flight: d.flight || null,
      preparedAt: new Date().toISOString(),
    };
    await db()
      .update(schema.stays)
      .set({ preparation, arrivalMode: d.arrivalMode ?? stay.arrivalMode, arrivalTime: d.arrivalTime || stay.arrivalTime })
      .where(eq(schema.stays.id, stay.id));
    await audit({ actorUserId: user.id, action: "stay.prepare", entity: "stays", entityId: stay.id, after: preparation });
    await notifier().send({ userId: user.id, type: "stay", title: "Estancia en preparación", body: "Concierge ya tiene tus respuestas. Te avisamos cada confirmación.", deepLink: `/stays/${stay.id}` });
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, error: e.message };
    throw e;
  }
  revalidatePath(`/stays/${d.stayId}`);
  redirect(`/stays/${d.stayId}`);
}

const inviteSchema = z.object({
  stayId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  canBook: z.string().optional(),
});

/** Pantalla 26: invitar. Crea el invitado y su liga de acceso. */
export async function inviteGuest(_prev: StayActionState, form: FormData): Promise<StayActionState> {
  const user = await requireUser();
  const parsed = inviteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const d = parsed.data;
  try {
    await hostStay(d.stayId, user.id);
    const r = await fractionCore().assignGuest({
      stayId: d.stayId,
      invitedBy: user.id,
      name: d.name,
      email: d.email || null,
      phone: d.phone || null,
      permissions: { can_view_access: true, can_book_services: d.canBook === "on" },
    });
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    revalidatePath(`/stays/${d.stayId}/guests`);
    return { ok: true, inviteUrl: `${base}/i/${r.inviteToken}` };
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, error: e.message };
    throw e;
  }
}

/** Check-in del anfitrión: la estancia pasa a "en curso" (modo estoy aquí). */
export async function checkIn(form: FormData) {
  const user = await requireUser();
  const stayId = String(form.get("stayId") ?? "");
  const stay = await hostStay(stayId, user.id);
  if (stay.status !== "upcoming") redirect(`/stays/${stay.id}`);
  await db().update(schema.stays).set({ status: "in_progress", checkedInAt: new Date() }).where(eq(schema.stays.id, stay.id));
  await db().update(schema.fractionWeeks).set({ status: "occupied" }).where(eq(schema.fractionWeeks.id, stay.fractionWeekId));
  await audit({ actorUserId: user.id, action: "stay.check_in", entity: "stays", entityId: stay.id, before: { status: "upcoming" }, after: { status: "in_progress" } });
  await emit("stay.started", "stay", stay.id, {});
  revalidatePath("/", "layout");
  redirect(`/stays/${stay.id}`);
}

export async function checkOut(form: FormData) {
  const user = await requireUser();
  const stayId = String(form.get("stayId") ?? "");
  const stay = await hostStay(stayId, user.id);
  if (stay.status !== "in_progress") redirect(`/stays/${stay.id}`);
  await db().update(schema.stays).set({ status: "completed", checkedOutAt: new Date() }).where(eq(schema.stays.id, stay.id));
  await db().update(schema.fractionWeeks).set({ status: "completed" }).where(eq(schema.fractionWeeks.id, stay.fractionWeekId));
  await audit({ actorUserId: user.id, action: "stay.check_out", entity: "stays", entityId: stay.id, before: { status: "in_progress" }, after: { status: "completed" } });
  await emit("stay.completed", "stay", stay.id, {});
  revalidatePath("/", "layout");
  redirect(`/stays/${stay.id}`);
}

/** Aceptar invitación desde /i/[token]. Vincula la cuenta al invitado. */
export async function acceptInvite(token: string) {
  const user = await requireUser();
  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256").update(token).digest("hex");
  const d = db();
  const at = await d.query.accessTokens.findFirst({ where: eq(schema.accessTokens.tokenHash, hash) });
  if (!at || at.kind !== "guest_invite" || !at.stayId) throw notFound("Esta invitación no existe.");
  if (at.revokedAt || at.expiresAt < new Date()) throw forbidden("Esta invitación ya venció.");
  const pending = (await d.query.stayGuests.findMany({ where: eq(schema.stayGuests.stayId, at.stayId) })).find((g) => g.status === "invited" && !g.userId && (g.email ? g.email.toLowerCase() === user.email.toLowerCase() : true));
  if (pending) {
    await d.update(schema.stayGuests).set({ userId: user.id, status: "accepted", respondedAt: new Date() }).where(eq(schema.stayGuests.id, pending.id));
  }
  await d.update(schema.accessTokens).set({ usedAt: new Date() }).where(eq(schema.accessTokens.id, at.id));
  await d.insert(schema.userRoles).values({ userId: user.id, role: "guest" }).onConflictDoNothing();
  const stay = await d.query.stays.findFirst({ where: eq(schema.stays.id, at.stayId) });
  if (stay) await notifier().send({ userId: stay.hostUserId, type: "stay", title: `${user.name} aceptó tu invitación`, body: "Ya forma parte de tu estancia.", deepLink: `/stays/${stay.id}/guests` });
  revalidatePath("/", "layout");
  redirect(`/stays/${at.stayId}`);
}
