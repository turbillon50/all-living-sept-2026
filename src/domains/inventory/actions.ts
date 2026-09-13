"use server";
import { redirect } from "next/navigation";
import { and, eq, lt, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { conflict, notFound } from "@/core/errors";

const holdSchema = z.object({ inventoryId: z.string().uuid(), checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), guests: z.coerce.number().int().min(1).max(30) });

export async function holdTime(form: FormData) {
  const user = await requireUser();
  const parsed = holdSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) throw conflict("Revisa fechas y huéspedes.");
  const { inventoryId, checkIn, checkOut, guests } = parsed.data;
  const d = db();
  const inv = await d.query.timeInventory.findFirst({ where: eq(schema.timeInventory.id, inventoryId) });
  if (!inv) throw notFound("Ese tiempo ya no está disponible.");
  if (checkIn < inv.startDate || checkOut > inv.endDate || checkOut <= checkIn) throw conflict("Las fechas ya no coinciden con este inventario.");
  const now = new Date();
  const heldUntil = new Date(now.getTime() + 10 * 60 * 1000);
  const updated = await d.update(schema.timeInventory).set({ status: "held", heldUntil, heldByUserId: user.id }).where(and(
    eq(schema.timeInventory.id, inventoryId),
    or(eq(schema.timeInventory.status, "available"), and(eq(schema.timeInventory.status, "held"), lt(schema.timeInventory.heldUntil, now)), and(eq(schema.timeInventory.status, "held"), eq(schema.timeInventory.heldByUserId, user.id))),
  )).returning({ id: schema.timeInventory.id });
  if (updated.length === 0) throw conflict("Alguien más está reservando este tiempo. Busca otra opción.");
  redirect(`/book/stay/${inventoryId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&held=1`);
}
