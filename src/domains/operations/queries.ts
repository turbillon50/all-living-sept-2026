import { and, asc, desc, eq, gte, inArray, lt, ne } from "drizzle-orm";
import { db, schema } from "@/db/client";

function dayRange(offset = 0) {
  const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() + offset);
  const to = new Date(from); to.setDate(to.getDate() + 1);
  return { from, to, iso: from.toISOString().slice(0, 10) };
}

/** Lo de hoy para operación: check-ins, check-outs, incidencias abiertas, servicios del día. */
export async function opsToday() {
  const d = db();
  const { from, to, iso } = dayRange();
  const [checkIns, checkOuts, incidents, services] = await Promise.all([
    d.select({ stay: schema.stays, property: schema.properties, host: schema.users }).from(schema.stays).innerJoin(schema.properties, eq(schema.properties.id, schema.stays.propertyId)).innerJoin(schema.users, eq(schema.users.id, schema.stays.hostUserId)).where(and(eq(schema.stays.startDate, iso), ne(schema.stays.status, "cancelled"))),
    d.select({ stay: schema.stays, property: schema.properties, host: schema.users }).from(schema.stays).innerJoin(schema.properties, eq(schema.properties.id, schema.stays.propertyId)).innerJoin(schema.users, eq(schema.users.id, schema.stays.hostUserId)).where(and(eq(schema.stays.endDate, iso), ne(schema.stays.status, "cancelled"))),
    d.select({ inc: schema.incidents, property: schema.properties }).from(schema.incidents).innerJoin(schema.properties, eq(schema.properties.id, schema.incidents.propertyId)).where(inArray(schema.incidents.status, ["open", "assigned", "in_progress"])).orderBy(desc(schema.incidents.priority), asc(schema.incidents.createdAt)),
    d.select({ b: schema.serviceBookings, service: schema.providerServices, provider: schema.providers, property: schema.properties }).from(schema.serviceBookings).innerJoin(schema.providerServices, eq(schema.providerServices.id, schema.serviceBookings.serviceId)).innerJoin(schema.providers, eq(schema.providers.id, schema.serviceBookings.providerId)).leftJoin(schema.properties, eq(schema.properties.id, schema.serviceBookings.propertyId)).where(and(gte(schema.serviceBookings.scheduledAt, from), lt(schema.serviceBookings.scheduledAt, to), ne(schema.serviceBookings.status, "cancelled"))).orderBy(asc(schema.serviceBookings.scheduledAt)),
  ]);
  return { checkIns, checkOuts, incidents, services, iso };
}

export async function upcomingStays(days = 14) {
  const { iso } = dayRange();
  const end = dayRange(days).iso;
  return db().select({ stay: schema.stays, property: schema.properties, host: schema.users }).from(schema.stays).innerJoin(schema.properties, eq(schema.properties.id, schema.stays.propertyId)).innerJoin(schema.users, eq(schema.users.id, schema.stays.hostUserId)).where(and(gte(schema.stays.startDate, iso), lt(schema.stays.startDate, end), ne(schema.stays.status, "cancelled"))).orderBy(asc(schema.stays.startDate));
}

export async function incidentById(id: string) {
  const rows = await db().select({ inc: schema.incidents, property: schema.properties, reporter: schema.users }).from(schema.incidents).innerJoin(schema.properties, eq(schema.properties.id, schema.incidents.propertyId)).innerJoin(schema.users, eq(schema.users.id, schema.incidents.reporterUserId)).where(eq(schema.incidents.id, id)).limit(1);
  return rows[0] ?? null;
}
