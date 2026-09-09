import { and, asc, eq, ne, sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { db, schema } from "@/db/client";
import { audit, emit } from "@/core/events";
import { conflict, forbidden, notFound } from "@/core/errors";
import type {
  AssignGuestInput,
  ClaimWeekInput,
  Fraction,
  FractionCoreClient,
  FractionWeek,
  Ownership,
  ReleaseWeekInput,
  TransferOwnershipInput,
} from "./fraction-core";

const toWeek = (w: typeof schema.fractionWeeks.$inferSelect): FractionWeek => ({
  id: w.id,
  fractionId: w.fractionId,
  year: w.year,
  weekNumber: w.weekNumber,
  startDate: w.startDate,
  endDate: w.endDate,
  season: w.season,
  status: w.status,
  statusReason: w.statusReason,
});

/** Implementación local del contrato sobre Neon. Reglas de dominio verificadas en DB (índices únicos). */
export class LocalFractionCore implements FractionCoreClient {
  async getUserOwnerships(userId: string): Promise<Ownership[]> {
    const rows = await db()
      .select({
        id: schema.fractionOwnerships.id,
        fractionId: schema.fractions.id,
        fractionCode: schema.fractions.code,
        propertyId: schema.properties.id,
        propertyName: schema.properties.name,
        destination: schema.properties.destination,
        share: schema.fractionOwnerships.share,
        acquiredAt: schema.fractionOwnerships.acquiredAt,
        active: schema.fractionOwnerships.active,
      })
      .from(schema.fractionOwnerships)
      .innerJoin(schema.fractions, eq(schema.fractions.id, schema.fractionOwnerships.fractionId))
      .innerJoin(schema.properties, eq(schema.properties.id, schema.fractions.propertyId))
      .where(and(eq(schema.fractionOwnerships.ownerUserId, userId), eq(schema.fractionOwnerships.active, true)))
      .orderBy(asc(schema.properties.name), asc(schema.fractions.code));
    return rows.map((r) => ({ ...r, share: Number(r.share) }));
  }

  async getFraction(fractionId: string): Promise<Fraction | null> {
    const row = await db()
      .select({
        id: schema.fractions.id,
        code: schema.fractions.code,
        propertyId: schema.properties.id,
        propertyName: schema.properties.name,
        destination: schema.properties.destination,
        totalWeeks: schema.fractions.totalWeeks,
        status: schema.fractions.status,
      })
      .from(schema.fractions)
      .innerJoin(schema.properties, eq(schema.properties.id, schema.fractions.propertyId))
      .where(eq(schema.fractions.id, fractionId))
      .limit(1);
    return row[0] ?? null;
  }

  async getFractionWeeks(fractionId: string): Promise<FractionWeek[]> {
    const rows = await db().query.fractionWeeks.findMany({
      where: eq(schema.fractionWeeks.fractionId, fractionId),
      orderBy: asc(schema.fractionWeeks.startDate),
    });
    return rows.map(toWeek);
  }

  async getWeek(weekId: string): Promise<FractionWeek | null> {
    const row = await db().query.fractionWeeks.findFirst({ where: eq(schema.fractionWeeks.id, weekId) });
    return row ? toWeek(row) : null;
  }

  async getWeekAvailability(weekId: string) {
    const w = await this.getWeek(weekId);
    if (!w) throw notFound("Esa semana no existe.");
    return { available: w.status === "available", status: w.status, reason: w.statusReason ?? undefined };
  }

  private async assertOwner(fractionId: string, userId: string) {
    const own = await db().query.fractionOwnerships.findFirst({
      where: and(
        eq(schema.fractionOwnerships.fractionId, fractionId),
        eq(schema.fractionOwnerships.ownerUserId, userId),
        eq(schema.fractionOwnerships.active, true),
      ),
    });
    if (!own) throw forbidden("Esta fracción no está a tu nombre.");
    return own;
  }

  async claimWeek(input: ClaimWeekInput) {
    const d = db();
    const week = await d.query.fractionWeeks.findFirst({ where: eq(schema.fractionWeeks.id, input.weekId) });
    if (!week) throw notFound("Esa semana no existe.");
    await this.assertOwner(week.fractionId, input.ownerUserId);
    const fraction = await d.query.fractions.findFirst({ where: eq(schema.fractions.id, week.fractionId) });
    if (!fraction) throw notFound();

    // Paso atómico: solo avanza si la semana sigue disponible.
    const updated = await d
      .update(schema.fractionWeeks)
      .set({ status: "reserved_owner", statusReason: null })
      .where(and(eq(schema.fractionWeeks.id, week.id), eq(schema.fractionWeeks.status, "available")))
      .returning({ id: schema.fractionWeeks.id });
    if (updated.length === 0) throw conflict("Esta semana ya no está disponible.", { status: week.status });

    try {
      const [stay] = await d
        .insert(schema.stays)
        .values({
          fractionWeekId: week.id,
          propertyId: fraction.propertyId,
          hostUserId: input.ownerUserId,
          startDate: week.startDate,
          endDate: week.endDate,
          guestsCount: input.guestsCount,
          arrivalTime: input.arrivalTime ?? null,
          arrivalMode: input.arrivalMode ?? null,
          notes: input.notes ?? null,
        })
        .returning({ id: schema.stays.id });
      if (!stay) throw conflict("No se pudo crear la estancia.");
      await d
        .insert(schema.stayGuests)
        .values({ stayId: stay.id, userId: input.ownerUserId, name: "Anfitrión", role: "host", status: "accepted" });
      await audit({
        actorUserId: input.ownerUserId,
        action: "week.claim",
        entity: "fraction_weeks",
        entityId: week.id,
        before: { status: "available" },
        after: { status: "reserved_owner", stayId: stay.id },
      });
      await emit("week.claimed", "fraction_week", week.id, { stayId: stay.id, ownerUserId: input.ownerUserId });
      await emit("stay.created", "stay", stay.id, { weekId: week.id });
      return { stayId: stay.id, weekId: week.id };
    } catch (e) {
      // Compensación: si la estancia no se pudo crear (p. ej. ya existía una viva), la semana vuelve a disponible.
      await d
        .update(schema.fractionWeeks)
        .set({ status: "available" })
        .where(and(eq(schema.fractionWeeks.id, week.id), eq(schema.fractionWeeks.status, "reserved_owner")));
      if (e instanceof Error && /stays_week_live_uq/.test(e.message)) {
        throw conflict("Esta semana ya tiene una estancia.");
      }
      throw e;
    }
  }

  async releaseWeekForRental(input: ReleaseWeekInput) {
    const d = db();
    const week = await d.query.fractionWeeks.findFirst({ where: eq(schema.fractionWeeks.id, input.weekId) });
    if (!week) throw notFound("Esa semana no existe.");
    await this.assertOwner(week.fractionId, input.ownerUserId);

    const updated = await d
      .update(schema.fractionWeeks)
      .set({ status: "released_for_rent", statusReason: null })
      .where(and(eq(schema.fractionWeeks.id, week.id), eq(schema.fractionWeeks.status, "available")))
      .returning({ id: schema.fractionWeeks.id });
    if (updated.length === 0) throw conflict("Solo puedes liberar una semana disponible.", { status: week.status });

    try {
      const [inv] = await d
        .insert(schema.rentalInventory)
        .values({
          fractionWeekId: week.id,
          ownerUserId: input.ownerUserId,
          nightlyRateEstimate: input.nightlyRateEstimate != null ? String(input.nightlyRateEstimate) : null,
          currency: input.currency ?? "MXN",
          commissionPct: String(input.commissionPct ?? 0),
          minNights: input.minNights ?? 7,
          cancellationPolicy: input.cancellationPolicy ?? null,
        })
        .returning({ id: schema.rentalInventory.id });
      if (!inv) throw conflict("No se pudo crear el inventario.");
      await audit({
        actorUserId: input.ownerUserId,
        action: "week.release",
        entity: "fraction_weeks",
        entityId: week.id,
        before: { status: "available" },
        after: { status: "released_for_rent", inventoryId: inv.id },
      });
      await emit("week.released", "fraction_week", week.id, { inventoryId: inv.id });
      await emit("inventory.released", "rental_inventory", inv.id, { weekId: week.id });
      return { inventoryId: inv.id, weekId: week.id };
    } catch (e) {
      await d
        .update(schema.fractionWeeks)
        .set({ status: "available" })
        .where(and(eq(schema.fractionWeeks.id, week.id), eq(schema.fractionWeeks.status, "released_for_rent")));
      if (e instanceof Error && /rental_inventory_week_uq/.test(e.message)) {
        throw conflict("Esta semana ya está liberada para renta.");
      }
      throw e;
    }
  }

  async assignGuest(input: AssignGuestInput) {
    const d = db();
    const stay = await d.query.stays.findFirst({ where: eq(schema.stays.id, input.stayId) });
    if (!stay) throw notFound("Esa estancia no existe.");
    if (stay.hostUserId !== input.invitedBy) throw forbidden("Solo el anfitrión invita.");
    if (stay.status === "cancelled" || stay.status === "completed") throw conflict("La estancia ya no admite invitados.");

    const raw = randomBytes(24).toString("base64url");
    const tokenHash = createHash("sha256").update(raw).digest("hex");
    const [guest] = await d
      .insert(schema.stayGuests)
      .values({
        stayId: stay.id,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        role: "guest",
        status: "invited",
        permissions: input.permissions ?? { can_view_access: true, can_book_services: false },
        invitedBy: input.invitedBy,
      })
      .returning({ id: schema.stayGuests.id });
    if (!guest) throw conflict("No se pudo invitar.");
    await d.insert(schema.accessTokens).values({
      userId: input.invitedBy,
      stayId: stay.id,
      kind: "guest_invite",
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    });
    await emit("guest.invited", "stay", stay.id, { guestId: guest.id });
    return { guestId: guest.id, inviteToken: raw };
  }

  async transferOwnership(input: TransferOwnershipInput) {
    if (input.actorRole !== "admin") throw forbidden("La transferencia de titularidad es de sistemas autorizados.");
    const d = db();
    const current = await d.query.fractionOwnerships.findFirst({
      where: and(
        eq(schema.fractionOwnerships.fractionId, input.fractionId),
        eq(schema.fractionOwnerships.ownerUserId, input.fromUserId),
        eq(schema.fractionOwnerships.active, true),
      ),
    });
    if (!current) throw notFound("No hay titularidad activa que transferir.");
    const now = new Date();
    const closed = await d
      .update(schema.fractionOwnerships)
      .set({ active: false, transferredAt: now })
      .where(and(eq(schema.fractionOwnerships.id, current.id), eq(schema.fractionOwnerships.active, true)))
      .returning({ id: schema.fractionOwnerships.id });
    if (closed.length === 0) throw conflict("La titularidad cambió mientras se procesaba.");
    const [opened] = await d
      .insert(schema.fractionOwnerships)
      .values({
        fractionId: input.fractionId,
        ownerUserId: input.toUserId,
        share: current.share,
        acquiredAt: now,
        source: input.source ?? "transfer",
      })
      .returning({ id: schema.fractionOwnerships.id });
    if (!opened) throw conflict("No se pudo abrir la nueva titularidad.");
    await audit({
      actorUserId: input.actorUserId,
      action: "ownership.transfer",
      entity: "fraction_ownerships",
      entityId: opened.id,
      before: { ownershipId: current.id, ownerUserId: input.fromUserId },
      after: { ownershipId: opened.id, ownerUserId: input.toUserId },
    });
    await emit("ownership.transferred", "fraction", input.fractionId, { from: input.fromUserId, to: input.toUserId });
    return { closedOwnershipId: current.id, newOwnershipId: opened.id };
  }

  async syncOwnerships(): Promise<{ synced: number }> {
    // Sin adaptador externo todavía: la fuente local es la verdad. Ver INTEGRATIONS.md.
    return { synced: 0 };
  }
}

/** Semanas de un titular (todas sus fracciones), ordenadas por fecha. Consulta de lectura del core. */
export async function weeksForOwner(userId: string) {
  return db()
    .select({
      week: schema.fractionWeeks,
      fractionCode: schema.fractions.code,
      fractionId: schema.fractions.id,
      propertyId: schema.properties.id,
      propertyName: schema.properties.name,
      destination: schema.properties.destination,
    })
    .from(schema.fractionWeeks)
    .innerJoin(schema.fractions, eq(schema.fractions.id, schema.fractionWeeks.fractionId))
    .innerJoin(schema.properties, eq(schema.properties.id, schema.fractions.propertyId))
    .innerJoin(
      schema.fractionOwnerships,
      and(eq(schema.fractionOwnerships.fractionId, schema.fractions.id), eq(schema.fractionOwnerships.active, true)),
    )
    .where(and(eq(schema.fractionOwnerships.ownerUserId, userId), ne(schema.fractionWeeks.status, "cancelled")))
    .orderBy(asc(schema.fractionWeeks.startDate));
}

let client: FractionCoreClient | null = null;
export function fractionCore(): FractionCoreClient {
  client ??= new LocalFractionCore();
  return client;
}

export const _sql = sql;
