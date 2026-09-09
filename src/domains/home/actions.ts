"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/domains/identity/current-user";
import { claimDemoFor } from "@/domains/identity/demo";

export async function claimDemo() {
  const user = await requireUser();
  await claimDemoFor(user.id);
  revalidatePath("/", "layout");
}
