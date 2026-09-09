import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { ServiceCategorySlug } from "./categories";

export type ProviderCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  logoUrl: string | null;
  cover: string | null;
  description: string | null;
  verified: boolean;
  priceFrom: { amount: string; currency: string; unit: string } | null;
  rating: { avg: number; count: number } | null;
  areas: string[];
  isDemo: boolean;
};

/** Reseñas reales solamente: si no hay, rating null. Nunca se fabrica. */
async function ratingsFor(providerIds: string[]) {
  const map = new Map<string, { avg: number; count: number }>();
  if (providerIds.length === 0) return map;
  const rows = await db()
    .select({ providerId: schema.reviews.providerId, avg: sql<number>`avg(${schema.reviews.rating})::float`, count: sql<number>`count(*)::int` })
    .from(schema.reviews)
    .where(inArray(schema.reviews.providerId, providerIds))
    .groupBy(schema.reviews.providerId);
  for (const r of rows) map.set(r.providerId, { avg: Number(r.avg), count: Number(r.count) });
  return map;
}

export async function providersByCategory(category: ServiceCategorySlug, destination?: string): Promise<ProviderCard[]> {
  const d = db();
  const provs = await d.query.providers.findMany({ where: eq(schema.providers.status, "approved"), orderBy: asc(schema.providers.businessName) });
  const ids = provs.map((p) => p.id);
  if (ids.length === 0) return [];
  const [services, areas, ratings] = await Promise.all([
    d.query.providerServices.findMany({ where: and(inArray(schema.providerServices.providerId, ids), eq(schema.providerServices.category, category), eq(schema.providerServices.active, true)), orderBy: asc(schema.providerServices.priceFrom) }),
    d.query.providerServiceAreas.findMany({ where: inArray(schema.providerServiceAreas.providerId, ids) }),
    ratingsFor(ids),
  ]);
  const out: ProviderCard[] = [];
  for (const p of provs) {
    const mine = services.filter((s) => s.providerId === p.id);
    if (mine.length === 0) continue;
    const myAreas = areas.filter((a) => a.providerId === p.id).map((a) => a.destination);
    if (destination && myAreas.length > 0 && !myAreas.includes(destination)) continue;
    const cheapest = mine.find((s) => s.priceFrom != null) ?? null;
    out.push({
      id: p.id,
      slug: p.slug,
      name: p.businessName,
      category,
      logoUrl: p.logoUrl,
      cover: mine[0]?.coverUrl ?? p.gallery[0] ?? null,
      description: p.description,
      verified: p.status === "approved",
      priceFrom: cheapest?.priceFrom ? { amount: cheapest.priceFrom, currency: cheapest.currency, unit: cheapest.unit } : null,
      rating: ratings.get(p.id) ?? null,
      areas: myAreas,
      isDemo: p.isDemo,
    });
  }
  return out;
}

export async function providerBySlug(slug: string) {
  const d = db();
  const p = await d.query.providers.findFirst({ where: eq(schema.providers.slug, slug) });
  if (!p) return null;
  const [services, areas, reviews, ratings] = await Promise.all([
    d.query.providerServices.findMany({ where: and(eq(schema.providerServices.providerId, p.id), eq(schema.providerServices.active, true)), orderBy: asc(schema.providerServices.name) }),
    d.query.providerServiceAreas.findMany({ where: eq(schema.providerServiceAreas.providerId, p.id) }),
    d.query.reviews.findMany({ where: eq(schema.reviews.providerId, p.id), orderBy: desc(schema.reviews.createdAt), limit: 10 }),
    ratingsFor([p.id]),
  ]);
  return { ...p, services, areas: areas.map((a) => a.destination), reviews, rating: ratings.get(p.id) ?? null };
}

export async function serviceById(id: string) {
  const row = (
    await db()
      .select({ service: schema.providerServices, provider: schema.providers })
      .from(schema.providerServices)
      .innerJoin(schema.providers, eq(schema.providers.id, schema.providerServices.providerId))
      .where(eq(schema.providerServices.id, id))
      .limit(1)
  )[0];
  return row ?? null;
}

export async function bookingsForUser(userId: string) {
  return db()
    .select({ b: schema.serviceBookings, service: schema.providerServices, provider: schema.providers })
    .from(schema.serviceBookings)
    .innerJoin(schema.providerServices, eq(schema.providerServices.id, schema.serviceBookings.serviceId))
    .innerJoin(schema.providers, eq(schema.providers.id, schema.serviceBookings.providerId))
    .where(eq(schema.serviceBookings.requesterUserId, userId))
    .orderBy(desc(schema.serviceBookings.scheduledAt));
}
