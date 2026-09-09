"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/domains/identity/current-user";
import { fractionCore } from "./local-fraction-core";
import { DomainError } from "@/core/errors";
import { notifier } from "@/integrations/notifications";
import { channelManager } from "@/integrations/channel-manager";
import { formatRange } from "@/core/format";

export type WeekActionState = { ok: boolean; error?: string } | null;

const useSchema = z.object({
  weekId: z.string().uuid(),
  guestsCount: z.coerce.number().int().min(1).max(12),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  arrivalMode: z.enum(["vuelo", "auto", "otro"]).optional(),
  notes: z.string().max(500).optional().or(z.literal("")),
  rules: z.literal("on", { message: "Acepta las reglas de la casa para continuar." }),
});

/** Pantalla 18: USAR. Crea la estancia y manda a prepararla. */
export async function useWeek(_prev: WeekActionState, form: FormData): Promise<WeekActionState> {
  const user = await requireRole("owner");
  const parsed = useSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const { weekId, guestsCount, arrivalTime, arrivalMode, notes } = parsed.data;
  let stayId: string;
  try {
    const r = await fractionCore().claimWeek({ weekId, ownerUserId: user.id, guestsCount, arrivalTime: arrivalTime || null, arrivalMode: arrivalMode ?? null, notes: notes || null });
    stayId = r.stayId;
    const week = await fractionCore().getWeek(weekId);
    if (week) {
      await notifier().send({ userId: user.id, type: "stay", title: "Tu estancia está creada", body: `${formatRange(week.startDate, week.endDate)}. Ahora prepárala a tu gusto.`, deepLink: `/stays/${stayId}` });
    }
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, error: e.message };
    throw e;
  }
  revalidatePath("/weeks");
  revalidatePath("/home");
  redirect(`/stays/${stayId}/prepare`);
}

const releaseSchema = z.object({
  weekId: z.string().uuid(),
  nightlyRateEstimate: z.coerce.number().min(0).optional(),
  hasEstimate: z.string().optional(),
  minNights: z.coerce.number().int().min(1).max(7).default(7),
  cancellationPolicy: z.enum(["flexible", "moderada", "estricta"]).default("moderada"),
  confirm: z.literal("on", { message: "Confirma que entiendes qué significa liberar la semana." }),
});

const POLICY_TEXT: Record<string, string> = {
  flexible: "Flexible: cancelación sin costo hasta 14 días antes.",
  moderada: "Moderada: cancelación sin costo hasta 30 días antes.",
  estricta: "Estricta: sin reembolso después de confirmar.",
};

/** Pantalla 19: RENTAR. Libera la semana; no publica en canales sin adaptador real. */
export async function releaseWeek(_prev: WeekActionState, form: FormData): Promise<WeekActionState> {
  const user = await requireRole("owner");
  const parsed = releaseSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const d = parsed.data;
  try {
    const r = await fractionCore().releaseWeekForRental({
      weekId: d.weekId,
      ownerUserId: user.id,
      nightlyRateEstimate: d.hasEstimate === "on" && d.nightlyRateEstimate ? d.nightlyRateEstimate : null,
      commissionPct: 20,
      minNights: d.minNights,
      cancellationPolicy: POLICY_TEXT[d.cancellationPolicy] ?? null,
    });
    const week = await fractionCore().getWeek(d.weekId);
    if (week) {
      const pub = await channelManager().publish({ inventoryId: r.inventoryId, propertyName: "", destination: "", checkIn: week.startDate, checkOut: week.endDate, nightlyRateEstimate: null, currency: "MXN", minNights: d.minNights });
      await notifier().send({
        userId: user.id,
        type: "booking",
        title: "Tu semana está liberada",
        body: pub.published ? "Ya está publicada en los canales conectados." : `${formatRange(week.startDate, week.endDate)}. Cuando haya un canal conectado, la publicaremos.`,
        deepLink: `/weeks/${d.weekId}`,
      });
    }
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, error: e.message };
    throw e;
  }
  revalidatePath("/weeks");
  revalidatePath("/home");
  redirect(`/weeks/${d.weekId}?released=1`);
}
