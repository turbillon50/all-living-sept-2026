import { pgTable, text, uuid, numeric, date, index } from "drizzle-orm/pg-core";
import { base, demoFlag } from "./_base";
import { moneyStatusEnum, incomeSourceEnum } from "./enums";
import { properties } from "./properties";
import { fractions } from "./fractions";
import { users } from "./identity";
import { rentalBookings } from "./rentals";
import { serviceBookings } from "./bookings";

/** Estimado, pendiente, confirmado y pagado nunca se mezclan: cada fila lleva su status. */
export const expenses = pgTable(
  "expenses",
  {
    ...base,
    ...demoFlag,
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
    fractionId: uuid("fraction_id").references(() => fractions.id, { onDelete: "set null" }),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    category: text("category").notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("MXN"),
    incurredOn: date("incurred_on").notNull(),
    status: moneyStatusEnum("status").notNull().default("pending"),
    serviceBookingId: uuid("service_booking_id").references(() => serviceBookings.id, { onDelete: "set null" }),
  },
  (t) => [index("expenses_owner_idx").on(t.ownerUserId, t.incurredOn), index("expenses_property_idx").on(t.propertyId)],
);

export const incomeEntries = pgTable(
  "income_entries",
  {
    ...base,
    ...demoFlag,
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
    fractionId: uuid("fraction_id").references(() => fractions.id, { onDelete: "set null" }),
    source: incomeSourceEnum("source").notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("MXN"),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    status: moneyStatusEnum("status").notNull().default("estimated"),
    rentalBookingId: uuid("rental_booking_id").references(() => rentalBookings.id, { onDelete: "set null" }),
  },
  (t) => [index("income_entries_owner_idx").on(t.ownerUserId, t.periodStart), index("income_entries_status_idx").on(t.status)],
);
