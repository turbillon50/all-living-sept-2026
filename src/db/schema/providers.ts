import { pgTable, text, uuid, integer, boolean, numeric, jsonb, date, time, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { base, demoFlag } from "./_base";
import { providerKindEnum, providerStatusEnum, serviceCategoryEnum } from "./enums";
import { users } from "./identity";

export const providers = pgTable(
  "providers",
  {
    ...base,
    ...demoFlag,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    kind: providerKindEnum("kind").notNull().default("person"),
    businessName: text("business_name").notNull(),
    slug: text("slug").notNull(),
    primaryCategory: serviceCategoryEnum("primary_category").notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
    status: providerStatusEnum("status").notNull().default("draft"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewNote: text("review_note"),
    /** Datos fiscales y de pagos: referencia al adaptador, nunca datos sensibles crudos. */
    payoutRef: text("payout_ref"),
    taxRef: text("tax_ref"),
    contactPhone: text("contact_phone"),
    contactEmail: text("contact_email"),
  },
  (t) => [uniqueIndex("providers_slug_uq").on(t.slug), index("providers_status_idx").on(t.status), index("providers_user_idx").on(t.userId)],
);

export const providerServices = pgTable(
  "provider_services",
  {
    ...base,
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    category: serviceCategoryEnum("category").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    /** Precio "desde". Null = a cotizar. */
    priceFrom: numeric("price_from", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("MXN"),
    unit: text("unit").notNull().default("servicio"),
    durationMin: integer("duration_min"),
    maxPeople: integer("max_people"),
    options: jsonb("options").$type<Array<{ key: string; label: string; price: number }>>().notNull().default([]),
    cancellationPolicy: text("cancellation_policy"),
    coverUrl: text("cover_url"),
    active: boolean("active").notNull().default(true),
  },
  (t) => [index("provider_services_provider_idx").on(t.providerId), index("provider_services_category_idx").on(t.category, t.active)],
);

export const providerServiceAreas = pgTable(
  "provider_service_areas",
  {
    ...base,
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    destination: text("destination").notNull(),
    radiusKm: integer("radius_km"),
  },
  (t) => [uniqueIndex("provider_service_areas_uq").on(t.providerId, t.destination)],
);

export const providerAvailability = pgTable(
  "provider_availability",
  {
    ...base,
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    /** Regla semanal (weekday 0-6) o excepción por fecha. */
    weekday: integer("weekday"),
    date: date("date"),
    startTime: time("start_time"),
    endTime: time("end_time"),
    available: boolean("available").notNull().default(true),
  },
  (t) => [index("provider_availability_provider_idx").on(t.providerId, t.date)],
);
