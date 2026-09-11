import { pgTable, text, uuid, integer, boolean, jsonb, numeric, uniqueIndex, index } from "drizzle-orm/pg-core";
import { base, demoFlag } from "./_base";
import { propertyStatusEnum, mediaKindEnum } from "./enums";

export const properties = pgTable(
  "properties",
  {
    ...base,
    ...demoFlag,
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    destination: text("destination").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull().default("MX"),
    lat: numeric("lat", { precision: 9, scale: 6 }),
    lng: numeric("lng", { precision: 9, scale: 6 }),
    description: text("description"),
    amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
    rules: jsonb("rules").$type<string[]>().notNull().default([]),
    /** Dirección exacta: solo owner/operator con hito. Nunca a guest sin autorización. */
    addressPrivate: text("address_private"),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    maxGuests: integer("max_guests"),
    status: propertyStatusEnum("status").notNull().default("active"),
  },
  (t) => [uniqueIndex("properties_slug_uq").on(t.slug), index("properties_destination_idx").on(t.destination)],
);

export const propertyMedia = pgTable(
  "property_media",
  {
    ...base,
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    kind: mediaKindEnum("kind").notNull().default("photo"),
    sortOrder: integer("sort_order").notNull().default(0),
    isCover: boolean("is_cover").notNull().default(false),
    width: integer("width"),
    height: integer("height"),
  },
  (t) => [index("property_media_property_idx").on(t.propertyId, t.sortOrder)],
);
