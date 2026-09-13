import { and, asc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { coverFor } from "@/domains/properties/queries";

export type TimeSearch = { destination?: string; checkIn?: string; checkOut?: string; guests?: number };

export async function searchTimeInventory(input: TimeSearch) {
  const now = new Date();
  const where = and(
    eq(schema.properties.status, "active"),
    input.destination ? eq(schema.properties.destination, input.destination) : undefined,
    input.checkIn ? lte(schema.timeInventory.startDate, input.checkIn) : undefined,
    input.checkOut ? gte(schema.timeInventory.endDate, input.checkOut) : undefined,
    input.guests ? or(isNull(schema.properties.maxGuests), gte(schema.properties.maxGuests, input.guests)) : undefined,
    or(eq(schema.timeInventory.status, "available"), and(eq(schema.timeInventory.status, "held"), lte(schema.timeInventory.heldUntil, now))),
  );
  const rows = await db()
    .select({ inventory: schema.timeInventory, property: schema.properties })
    .from(schema.timeInventory)
    .innerJoin(schema.properties, eq(schema.properties.id, schema.timeInventory.propertyId))
    .where(where)
    .orderBy(asc(schema.timeInventory.startDate), asc(schema.properties.name));
  const covers = await coverFor(rows.map((r) => r.property.id));
  return rows.map(({ inventory, property }) => ({
    ...inventory,
    property: {
      id: property.id,
      name: property.name,
      destination: property.destination,
      city: property.city,
      bedrooms: property.bedrooms,
      maxGuests: property.maxGuests,
      cover: covers.get(property.id) ?? null,
    },
  }));
}

export async function timeInventoryById(id: string) {
  const row = (await db()
    .select({ inventory: schema.timeInventory, property: schema.properties })
    .from(schema.timeInventory)
    .innerJoin(schema.properties, eq(schema.properties.id, schema.timeInventory.propertyId))
    .where(eq(schema.timeInventory.id, id))
    .limit(1))[0];
  if (!row) return null;
  const covers = await coverFor([row.property.id]);
  return { ...row.inventory, property: { ...row.property, cover: covers.get(row.property.id) ?? null } };
}
