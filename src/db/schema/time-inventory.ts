import { pgTable, text, uuid, integer, numeric, date, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { base, demoFlag } from "./_base";
import { properties } from "./properties";
import { fractionWeeks } from "./fractions";
import { users } from "./identity";

/**
 * Fuente universal de TIEMPO vendible en All Living.
 * No importa si nace de fractional, propiedad completa, managed o partner:
 * la búsqueda y el checkout consumen esta tabla.
 */
export const timeInventory = pgTable(
  "time_inventory",
  {
    ...base,
    ...demoFlag,
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "restrict" }),
    ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    fractionWeekId: uuid("fraction_week_id").references(() => fractionWeeks.id, { onDelete: "restrict" }),
    source: text("source").notNull().default("managed"), // fractional | owner | managed | partner | last_minute
    sourceRef: text("source_ref"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    nightlyRate: numeric("nightly_rate", { precision: 12, scale: 2 }),
    cleaningFee: numeric("cleaning_fee", { precision: 12, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("MXN"),
    commissionPct: numeric("commission_pct", { precision: 5, scale: 2 }).notNull().default("0"),
    minNights: integer("min_nights").notNull().default(1),
    cancellationPolicy: text("cancellation_policy"),
    status: text("status").notNull().default("available"), // available | held | booked | withdrawn
    heldUntil: timestamp("held_until", { withTimezone: true }),
    heldByUserId: uuid("held_by_user_id").references(() => users.id, { onDelete: "set null" }),
    channel: text("channel"),
    externalRef: text("external_ref"),
    guaranteeEligible: boolean("guarantee_eligible").notNull().default(false),
  },
  (t) => [
    index("time_inventory_property_dates_idx").on(t.propertyId, t.startDate, t.endDate),
    index("time_inventory_status_dates_idx").on(t.status, t.startDate, t.endDate),
    index("time_inventory_owner_idx").on(t.ownerUserId),
    uniqueIndex("time_inventory_fraction_week_uq").on(t.fractionWeekId).where(sql`${t.fractionWeekId} is not null`),
  ],
);
