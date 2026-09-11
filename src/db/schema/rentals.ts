import { pgTable, text, uuid, integer, numeric, date, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { base, demoFlag } from "./_base";
import { inventoryStatusEnum, rentalBookingStatusEnum } from "./enums";
import { fractionWeeks } from "./fractions";
import { users } from "./identity";

/** Semana liberada para renta. Una semana solo puede estar liberada una vez. */
export const rentalInventory = pgTable(
  "rental_inventory",
  {
    ...base,
    ...demoFlag,
    fractionWeekId: uuid("fraction_week_id")
      .notNull()
      .references(() => fractionWeeks.id, { onDelete: "restrict" }),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    /** Estimación, siempre marcada como tal en UI. Null = sin estimación. */
    nightlyRateEstimate: numeric("nightly_rate_estimate", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("MXN"),
    commissionPct: numeric("commission_pct", { precision: 5, scale: 2 }).notNull().default("0"),
    minNights: integer("min_nights").notNull().default(7),
    cancellationPolicy: text("cancellation_policy"),
    status: inventoryStatusEnum("status").notNull().default("released"),
    /** Canal al que se envió vía ChannelManagerProvider (null = ninguno todavía). */
    channel: text("channel"),
    externalRef: text("external_ref"),
    releasedAt: timestamp("released_at", { withTimezone: true }).notNull().defaultNow(),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("rental_inventory_week_uq").on(t.fractionWeekId), index("rental_inventory_owner_idx").on(t.ownerUserId)],
);

export const rentalBookings = pgTable(
  "rental_bookings",
  {
    ...base,
    ...demoFlag,
    inventoryId: uuid("inventory_id")
      .notNull()
      .references(() => rentalInventory.id, { onDelete: "restrict" }),
    guestName: text("guest_name").notNull(),
    guestsCount: integer("guests_count").notNull().default(1),
    channel: text("channel").notNull().default("direct"),
    externalRef: text("external_ref"),
    checkIn: date("check_in").notNull(),
    checkOut: date("check_out").notNull(),
    grossAmount: numeric("gross_amount", { precision: 12, scale: 2 }).notNull(),
    netAmount: numeric("net_amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("MXN"),
    status: rentalBookingStatusEnum("status").notNull().default("confirmed"),
  },
  (t) => [index("rental_bookings_inventory_idx").on(t.inventoryId), index("rental_bookings_checkin_idx").on(t.checkIn)],
);
