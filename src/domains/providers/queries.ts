import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { db, schema } from "@/db/client";

export async function providerForUser(userId: string) {
  return db().query.providers.findFirst({ where: eq(schema.providers.userId, userId), orderBy: desc(schema.providers.createdAt) });
}

export async function jobsForProvider(providerId: string, range?: { from: Date; to: Date }) {
  const where = range
    ? and(eq(schema.serviceBookings.providerId, providerId), gte(schema.serviceBookings.scheduledAt, range.from), lt(schema.serviceBookings.scheduledAt, range.to))
    : eq(schema.serviceBookings.providerId, providerId);
  return db()
    .select({ b: schema.serviceBookings, service: schema.providerServices, property: schema.properties, requester: schema.users })
    .from(schema.serviceBookings)
    .innerJoin(schema.providerServices, eq(schema.providerServices.id, schema.serviceBookings.serviceId))
    .leftJoin(schema.properties, eq(schema.properties.id, schema.serviceBookings.propertyId))
    .innerJoin(schema.users, eq(schema.users.id, schema.serviceBookings.requesterUserId))
    .where(where)
    .orderBy(asc(schema.serviceBookings.scheduledAt));
}

export async function jobById(id: string) {
  const rows = await db()
    .select({ b: schema.serviceBookings, service: schema.providerServices, property: schema.properties, requester: schema.users, provider: schema.providers })
    .from(schema.serviceBookings)
    .innerJoin(schema.providerServices, eq(schema.providerServices.id, schema.serviceBookings.serviceId))
    .innerJoin(schema.providers, eq(schema.providers.id, schema.serviceBookings.providerId))
    .leftJoin(schema.properties, eq(schema.properties.id, schema.serviceBookings.propertyId))
    .innerJoin(schema.users, eq(schema.users.id, schema.serviceBookings.requesterUserId))
    .where(eq(schema.serviceBookings.id, id))
    .limit(1);
  return rows[0] ?? null;
}
