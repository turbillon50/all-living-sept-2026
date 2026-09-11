import { and, asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db/client";

export type PropertyCard = {
  id: string;
  slug: string;
  name: string;
  destination: string;
  city: string;
  cover: { url: string; alt: string } | null;
  bedrooms: number | null;
  maxGuests: number | null;
  isDemo: boolean;
};

export async function coverFor(propertyIds: string[]): Promise<Map<string, { url: string; alt: string }>> {
  const map = new Map<string, { url: string; alt: string }>();
  if (propertyIds.length === 0) return map;
  const rows = await db()
    .select({ propertyId: schema.propertyMedia.propertyId, url: schema.propertyMedia.url, alt: schema.propertyMedia.alt, isCover: schema.propertyMedia.isCover, sortOrder: schema.propertyMedia.sortOrder })
    .from(schema.propertyMedia)
    .where(inArray(schema.propertyMedia.propertyId, propertyIds))
    .orderBy(asc(schema.propertyMedia.sortOrder));
  for (const r of rows) {
    const cur = map.get(r.propertyId);
    if (!cur || r.isCover) map.set(r.propertyId, { url: r.url, alt: r.alt });
  }
  return map;
}

export async function propertyById(id: string) {
  const p = await db().query.properties.findFirst({ where: eq(schema.properties.id, id) });
  if (!p) return null;
  const media = await db().query.propertyMedia.findMany({ where: eq(schema.propertyMedia.propertyId, id), orderBy: asc(schema.propertyMedia.sortOrder) });
  return { ...p, media };
}

export async function activeProperties(): Promise<PropertyCard[]> {
  const rows = await db().query.properties.findMany({ where: and(eq(schema.properties.status, "active")), orderBy: asc(schema.properties.name) });
  const covers = await coverFor(rows.map((r) => r.id));
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    destination: p.destination,
    city: p.city,
    cover: covers.get(p.id) ?? null,
    bedrooms: p.bedrooms,
    maxGuests: p.maxGuests,
    isDemo: p.isDemo,
  }));
}
