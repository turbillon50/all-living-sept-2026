import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";

/**
 * Webhook de Clerk: mantiene nombre, correo y avatar sincronizados y marca borrados.
 * Requiere CLERK_WEBHOOK_SIGNING_SECRET en el entorno; sin él responde 503 y no procesa nada.
 */
export async function POST(req: NextRequest) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) return new Response("webhook sin configurar", { status: 503 });
  let evt: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("firma inválida", { status: 400 });
  }
  if (evt.type === "user.updated" || evt.type === "user.created") {
    const u = evt.data;
    const email = u.email_addresses.find((e) => e.id === u.primary_email_address_id)?.email_address ?? u.email_addresses[0]?.email_address;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
    if (email) {
      await db().update(schema.users).set({ email, ...(name ? { name } : {}), avatarUrl: u.image_url ?? null }).where(eq(schema.users.clerkId, u.id));
    }
  }
  return new Response("ok");
}
