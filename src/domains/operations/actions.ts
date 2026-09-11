"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { requireUser, requireRole } from "@/domains/identity/current-user";
import { DomainError, forbidden, notFound } from "@/core/errors";
import { audit, emit } from "@/core/events";
import { notifier } from "@/integrations/notifications";

export type IncidentActionState = { ok: boolean; error?: string } | null;

const createSchema = z.object({
  propertyId: z.string().uuid(),
  stayId: z.string().uuid().optional().or(z.literal("")),
  type: z.enum(["urgencia", "propiedad", "servicio", "acceso", "concierge", "otro"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  description: z.string().trim().min(5, "Cuéntanos qué pasa.").max(1000),
});

/** Pantalla 44: crear incidencia. Queda en open y avisa a operación. */
export async function createIncident(_prev: IncidentActionState, form: FormData): Promise<IncidentActionState> {
  const user = await requireUser();
  const parsed = createSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const d = parsed.data;
  const dbc = db();
  // El usuario debe tener relación con la propiedad: titular, anfitrión o invitado aceptado.
  const stay = d.stayId ? await dbc.query.stays.findFirst({ where: eq(schema.stays.id, d.stayId) }) : null;
  if (stay && stay.propertyId !== d.propertyId) return { ok: false, error: "La estancia no corresponde a esa propiedad." };
  let allowed = Boolean(stay && stay.hostUserId === user.id);
  if (!allowed && stay) {
    const g = await dbc.query.stayGuests.findFirst({ where: and(eq(schema.stayGuests.stayId, stay.id), eq(schema.stayGuests.userId, user.id), eq(schema.stayGuests.status, "accepted")) });
    allowed = Boolean(g);
  }
  if (!allowed) {
    const fr = await dbc.query.fractions.findMany({ where: eq(schema.fractions.propertyId, d.propertyId) });
    if (fr.length) {
      const own = await dbc.query.fractionOwnerships.findFirst({ where: and(inArray(schema.fractionOwnerships.fractionId, fr.map((f) => f.id)), eq(schema.fractionOwnerships.ownerUserId, user.id), eq(schema.fractionOwnerships.active, true)) });
      allowed = Boolean(own);
    }
  }
  if (!allowed && !user.roles.includes("operator") && !user.roles.includes("admin")) return { ok: false, error: "No tienes relación con esa propiedad." };
  const priority = d.type === "urgencia" ? "urgent" : d.priority;
  let id: string;
  try {
    const [row] = await dbc.insert(schema.incidents).values({ propertyId: d.propertyId, stayId: stay?.id ?? null, reporterUserId: user.id, type: d.type, priority, description: d.description }).returning({ id: schema.incidents.id });
    if (!row) throw notFound();
    id = row.id;
    await audit({ actorUserId: user.id, action: "incident.create", entity: "incidents", entityId: id, after: { type: d.type, priority } });
    await emit("incident.created", "incident", id, { propertyId: d.propertyId, priority });
    const ops = await dbc.query.userRoles.findMany({ where: and(eq(schema.userRoles.role, "operator"), eq(schema.userRoles.status, "active")) });
    await Promise.all(ops.map((o) => notifier().send({ userId: o.userId, type: "maintenance", title: priority === "urgent" ? "URGENTE · nueva incidencia" : "Nueva incidencia", body: d.description.slice(0, 120), deepLink: `/ops/incidents/${id}` })));
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, error: e.message };
    throw e;
  }
  revalidatePath("/support");
  redirect(`/incidents/${id}`);
}

const STATUS_FLOW: Record<string, string[]> = { open: ["assigned", "in_progress", "closed"], assigned: ["in_progress", "open", "closed"], in_progress: ["resolved"], resolved: ["closed", "in_progress"], closed: [] };

/** Operación: asignar / avanzar / resolver. */
export async function updateIncident(form: FormData) {
  const user = await requireRole("operator");
  const id = String(form.get("incidentId") ?? "");
  const to = String(form.get("status") ?? "") as (typeof schema.incidentStatusEnum.enumValues)[number];
  const note = String(form.get("note") ?? "").slice(0, 500);
  const inc = await db().query.incidents.findFirst({ where: eq(schema.incidents.id, id) });
  if (!inc) throw notFound();
  if (!STATUS_FLOW[inc.status]?.includes(to)) throw forbidden(`No se puede pasar de ${inc.status} a ${to}.`);
  await db().update(schema.incidents).set({ status: to, assignedOperatorId: to === "assigned" || to === "in_progress" ? user.id : inc.assignedOperatorId, resolvedAt: to === "resolved" ? new Date() : inc.resolvedAt, resolutionNote: note || inc.resolutionNote }).where(eq(schema.incidents.id, id));
  await audit({ actorUserId: user.id, action: `incident.${to}`, entity: "incidents", entityId: id, before: { status: inc.status }, after: { status: to } });
  if (to === "resolved") {
    await emit("incident.resolved", "incident", id, {});
    await notifier().send({ userId: inc.reporterUserId, type: "maintenance", title: "Tu incidencia quedó resuelta", body: note || undefined, deepLink: `/incidents/${id}` });
  }
  revalidatePath(`/ops/incidents/${id}`);
  revalidatePath(`/incidents/${id}`);
  redirect(`/ops/incidents/${id}`);
}
