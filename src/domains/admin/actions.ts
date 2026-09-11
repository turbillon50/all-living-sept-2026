"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireRole } from "@/domains/identity/current-user";
import { audit, emit } from "@/core/events";
import { notifier } from "@/integrations/notifications";
import { isRole } from "@/core/roles";

/** Aprobar / rechazar / suspender proveedores. Solo admin. Queda en auditoría. */
export async function reviewProvider(form: FormData) {
  const admin = await requireRole("admin");
  const id = String(form.get("providerId") ?? "");
  const decision = String(form.get("decision") ?? "");
  const note = String(form.get("note") ?? "").slice(0, 500);
  const prov = await db().query.providers.findFirst({ where: eq(schema.providers.id, id) });
  if (!prov) redirect("/admin/providers");
  const status = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : decision === "suspend" ? "suspended" : decision === "review" ? "under_review" : null;
  if (!status) redirect("/admin/providers");
  await db().update(schema.providers).set({ status, verifiedAt: status === "approved" ? new Date() : prov.verifiedAt, reviewedBy: admin.id, reviewNote: note || null }).where(eq(schema.providers.id, id));
  await audit({ actorUserId: admin.id, action: `provider.${status}`, entity: "providers", entityId: id, before: { status: prov.status }, after: { status, note } });
  if (status === "approved") {
    await emit("provider.approved", "provider", id, {});
    await db().insert(schema.userRoles).values({ userId: prov.userId, role: "provider" }).onConflictDoNothing();
  }
  await notifier().send({ userId: prov.userId, type: "provider", title: status === "approved" ? "Eres All Living Verified" : status === "rejected" ? "Tu perfil no fue aprobado" : `Tu perfil está en ${status}`, body: note || undefined, deepLink: "/pro/verification" });
  revalidatePath("/admin/providers");
  redirect("/admin/providers");
}

/** Otorgar o suspender roles. Un admin nunca se otorga admin a sí mismo desde la UI. */
export async function setUserRole(form: FormData) {
  const admin = await requireRole("admin");
  const userId = String(form.get("userId") ?? "");
  const role = String(form.get("role") ?? "");
  const action = String(form.get("action") ?? "grant");
  if (!isRole(role) || !userId) redirect("/admin/users");
  if (userId === admin.id && role === "admin") redirect("/admin/users");
  if (action === "grant") {
    await db().insert(schema.userRoles).values({ userId, role, grantedBy: admin.id }).onConflictDoUpdate({ target: [schema.userRoles.userId, schema.userRoles.role], set: { status: "active", grantedBy: admin.id } });
  } else {
    await db().update(schema.userRoles).set({ status: "suspended" }).where(eq(schema.userRoles.userId, userId));
  }
  await audit({ actorUserId: admin.id, action: `role.${action}`, entity: "user_roles", entityId: userId, after: { role } });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
