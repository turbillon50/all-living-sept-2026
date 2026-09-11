"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { isRole, type Role } from "@/core/roles";
import { getSessionUser, grantSelfServiceRole, requireUser, switchContext } from "./current-user";
import { INTERESTS } from "./onboarding-constants";

const INTENT_COOKIE = "al_intent";

/** Pantalla 03 → guarda la intención y manda a crear cuenta (o a entrar, si ya hay sesión). */
export async function chooseIntent(role: "owner" | "guest" | "provider") {
  const jar = await cookies();
  jar.set(INTENT_COOKIE, role, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  const user = await getSessionUser();
  redirect(user ? "/onboarding/profile" : "/sign-up");
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Dinos cómo te llamas.").max(80),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  locale: z.enum(["es-MX", "en-US"]).default("es-MX"),
});

export type ActionState = { ok: boolean; error?: string; fields?: Record<string, string> } | null;

export async function saveProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ name: form.get("name"), phone: form.get("phone"), locale: form.get("locale") ?? "es-MX" });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Revisa los datos.", fields: { [String(first?.path[0] ?? "")]: first?.message ?? "" } };
  }
  const d = db();
  await d.update(schema.users).set({ name: parsed.data.name, locale: parsed.data.locale }).where(eq(schema.users.id, user.id));
  await d.update(schema.userProfiles).set({ phone: parsed.data.phone || null }).where(eq(schema.userProfiles.userId, user.id));
  redirect("/onboarding/interests");
}


export async function saveInterests(form: FormData) {
  const user = await requireUser();
  const chosen = form.getAll("interest").map(String).filter((v) => (INTERESTS as readonly string[]).includes(v));
  await db().update(schema.userProfiles).set({ interests: chosen }).where(eq(schema.userProfiles.userId, user.id));
  redirect("/onboarding/permissions");
}

export async function savePermissions(form: FormData) {
  const user = await requireUser();
  await db()
    .update(schema.userProfiles)
    .set({ notificationsOptIn: form.get("notifications") === "on", locationOptIn: form.get("location") === "on" })
    .where(eq(schema.userProfiles.userId, user.id));
  redirect("/onboarding/done");
}

/** Pantalla 08 → cierra el onboarding: otorga el rol elegido y lo deja activo. */
export async function completeOnboarding() {
  const user = await requireUser();
  const jar = await cookies();
  const intent = jar.get(INTENT_COOKIE)?.value;
  const role: Role = isRole(intent) && intent !== "operator" && intent !== "admin" ? intent : "guest";
  await grantSelfServiceRole(user.id, role);
  await db().update(schema.userProfiles).set({ onboardingCompletedAt: new Date() }).where(eq(schema.userProfiles.userId, user.id));
  await switchContext(user.id, [...user.roles, role], role);
  jar.delete(INTENT_COOKIE);
  redirect(role === "provider" ? "/pro" : "/home");
}
