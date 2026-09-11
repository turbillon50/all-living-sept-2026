import { and, asc, desc, eq, inArray, ne, or } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { coverFor } from "@/domains/properties/queries";

export type StayCard = {
  id: string;
  propertyId: string;
  propertyName: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  guestsCount: number;
  cover: { url: string; alt: string } | null;
  isHost: boolean;
};

/** Estancias donde el usuario es anfitrión o invitado aceptado. */
export async function staysForUser(userId: string): Promise<StayCard[]> {
  const d = db();
  const guestStayIds = (
    await d
      .select({ stayId: schema.stayGuests.stayId })
      .from(schema.stayGuests)
      .where(and(eq(schema.stayGuests.userId, userId), eq(schema.stayGuests.status, "accepted")))
  ).map((r) => r.stayId);

  const rows = await d
    .select({ stay: schema.stays, propertyName: schema.properties.name, destination: schema.properties.destination })
    .from(schema.stays)
    .innerJoin(schema.properties, eq(schema.properties.id, schema.stays.propertyId))
    .where(
      and(
        ne(schema.stays.status, "cancelled"),
        guestStayIds.length > 0 ? or(eq(schema.stays.hostUserId, userId), inArray(schema.stays.id, guestStayIds)) : eq(schema.stays.hostUserId, userId),
      ),
    )
    .orderBy(asc(schema.stays.startDate));
  const covers = await coverFor([...new Set(rows.map((r) => r.stay.propertyId))]);
  return rows.map((r) => ({
    id: r.stay.id,
    propertyId: r.stay.propertyId,
    propertyName: r.propertyName,
    destination: r.destination,
    startDate: r.stay.startDate,
    endDate: r.stay.endDate,
    status: r.stay.status,
    guestsCount: r.stay.guestsCount,
    cover: covers.get(r.stay.propertyId) ?? null,
    isHost: r.stay.hostUserId === userId,
  }));
}

/** La estancia que manda en la Home: en curso, o la próxima. */
export async function nextStayFor(userId: string): Promise<StayCard | null> {
  const all = await staysForUser(userId);
  const today = new Date().toISOString().slice(0, 10);
  return all.find((s) => s.status === "in_progress") ?? all.find((s) => s.status === "upcoming" && s.endDate >= today) ?? null;
}

export async function stayById(id: string) {
  const d = db();
  const row = await d
    .select({ stay: schema.stays, property: schema.properties })
    .from(schema.stays)
    .innerJoin(schema.properties, eq(schema.properties.id, schema.stays.propertyId))
    .where(eq(schema.stays.id, id))
    .limit(1);
  const hit = row[0];
  if (!hit) return null;
  const [guests, bookings, media] = await Promise.all([
    d.query.stayGuests.findMany({ where: eq(schema.stayGuests.stayId, id), orderBy: asc(schema.stayGuests.createdAt) }),
    d
      .select({ booking: schema.serviceBookings, serviceName: schema.providerServices.name, providerName: schema.providers.businessName, category: schema.providerServices.category })
      .from(schema.serviceBookings)
      .innerJoin(schema.providerServices, eq(schema.providerServices.id, schema.serviceBookings.serviceId))
      .innerJoin(schema.providers, eq(schema.providers.id, schema.serviceBookings.providerId))
      .where(eq(schema.serviceBookings.stayId, id))
      .orderBy(asc(schema.serviceBookings.scheduledAt)),
    d.query.propertyMedia.findMany({ where: eq(schema.propertyMedia.propertyId, hit.property.id), orderBy: asc(schema.propertyMedia.sortOrder) }),
  ]);
  return { ...hit.stay, property: { ...hit.property, media }, guests, bookings };
}

export async function recentNotifications(userId: string, limit = 5) {
  return db().query.notifications.findMany({ where: eq(schema.notifications.userId, userId), orderBy: desc(schema.notifications.createdAt), limit });
}
