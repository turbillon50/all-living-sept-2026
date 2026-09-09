"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { homeFor, isRole } from "@/core/roles";
import { requireUser, switchContext } from "./current-user";

/** Pantalla 50: cambiar modo. No cierra sesión; persiste. */
export async function setMode(form: FormData) {
  const user = await requireUser();
  const next = form.get("role");
  if (!isRole(next)) redirect("/profile/mode");
  await switchContext(user.id, user.roles, next);
  revalidatePath("/", "layout");
  redirect(homeFor(next));
}

export async function updatePreferences(form: FormData) {
  const user = await requireUser();
  await db()
    .update(schema.userProfiles)
    .set({
      notificationsOptIn: form.get("notifications") === "on",
      locationOptIn: form.get("location") === "on",
      languages: form.getAll("language").map(String).filter(Boolean),
    })
    .where(eq(schema.userProfiles.userId, user.id));
  await db().update(schema.users).set({ locale: form.get("locale") === "en-US" ? "en-US" : "es-MX" }).where(eq(schema.users.id, user.id));
  revalidatePath("/profile");
  redirect("/profile");
}
