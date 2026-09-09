"use server";

import { revalidatePath } from "next/cache";
import { requireUser, switchContext } from "@/domains/identity/current-user";
import { claimDemoFor } from "@/domains/identity/demo";

export async function claimDemo() {
  const user = await requireUser();
  const { claimed } = await claimDemoFor(user.id);
  // Al reclamar el mundo DEMO la cuenta pasa a modo Propietario: es donde vive Casa Mar · Tulum.
  if (claimed) await switchContext(user.id, [...user.roles, "owner"], "owner");
  revalidatePath("/", "layout");
}
