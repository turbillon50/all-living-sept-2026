import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { env } from "@/core/env";
import { audit } from "@/core/events";

const DEMO_CLERK_ID = "demo_luis_garcia";

/** ¿Hay datos demo sin reclamar? Solo cuando SEED_DEMO está activo. */
export async function demoAvailable(): Promise<boolean> {
  if (!env().SEED_DEMO) return false;
  const u = await db().query.users.findFirst({ where: eq(schema.users.clerkId, DEMO_CLERK_ID) });
  return Boolean(u);
}

/**
 * Reasigna el mundo del usuario DEMO (Luis García) a la cuenta real que lo pide.
 * Solo en entornos con SEED_DEMO. Queda en auditoría. Los datos siguen marcados is_demo.
 */
export async function claimDemoFor(userId: string): Promise<{ claimed: boolean }> {
  if (!env().SEED_DEMO) return { claimed: false };
  const d = db();
  const demo = await d.query.users.findFirst({ where: eq(schema.users.clerkId, DEMO_CLERK_ID) });
  if (!demo || demo.id === userId) return { claimed: false };

  await d.update(schema.fractionOwnerships).set({ ownerUserId: userId }).where(eq(schema.fractionOwnerships.ownerUserId, demo.id));
  await d.update(schema.stays).set({ hostUserId: userId }).where(eq(schema.stays.hostUserId, demo.id));
  await d.update(schema.stayGuests).set({ userId }).where(eq(schema.stayGuests.userId, demo.id));
  await d.update(schema.serviceBookings).set({ requesterUserId: userId }).where(eq(schema.serviceBookings.requesterUserId, demo.id));
  await d.update(schema.rentalInventory).set({ ownerUserId: userId }).where(eq(schema.rentalInventory.ownerUserId, demo.id));
  await d.update(schema.incomeEntries).set({ ownerUserId: userId }).where(eq(schema.incomeEntries.ownerUserId, demo.id));
  await d.update(schema.notifications).set({ userId }).where(eq(schema.notifications.userId, demo.id));
  await d.update(schema.providers).set({ userId }).where(eq(schema.providers.userId, demo.id));
  for (const role of ["owner", "guest", "provider", "operator", "admin"] as const) {
    await d.insert(schema.userRoles).values({ userId, role }).onConflictDoNothing();
  }
  await audit({ actorUserId: userId, action: "demo.claim", entity: "users", entityId: demo.id, after: { claimedBy: userId } });
  return { claimed: true };
}
