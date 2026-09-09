import { pgTable, text, uuid, integer, date, time, timestamp, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { base } from "./_base";
import { stayStatusEnum, stayGuestRoleEnum, stayGuestStatusEnum } from "./enums";
import { properties } from "./properties";
import { fractionWeeks } from "./fractions";
import { users } from "./identity";

/** Una estancia consume una semana. Solo puede haber UNA estancia viva por semana. */
export const stays = pgTable(
  "stays",
  {
    ...base,
    fractionWeekId: uuid("fraction_week_id")
      .notNull()
      .references(() => fractionWeeks.id, { onDelete: "restrict" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "restrict" }),
    hostUserId: uuid("host_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: stayStatusEnum("status").notNull().default("upcoming"),
    guestsCount: integer("guests_count").notNull().default(1),
    arrivalTime: time("arrival_time"),
    arrivalMode: text("arrival_mode"),
    /** Preparación: supermercado, chef, cuna, celebración… */
    preparation: jsonb("preparation").$type<Record<string, unknown>>().notNull().default({}),
    notes: text("notes"),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    checkedOutAt: timestamp("checked_out_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("stays_week_live_uq")
      .on(t.fractionWeekId)
      .where(sql`${t.status} <> 'cancelled'`),
    index("stays_host_idx").on(t.hostUserId, t.startDate),
    index("stays_property_idx").on(t.propertyId, t.startDate),
  ],
);

export const stayGuests = pgTable(
  "stay_guests",
  {
    ...base,
    stayId: uuid("stay_id")
      .notNull()
      .references(() => stays.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    role: stayGuestRoleEnum("role").notNull().default("guest"),
    status: stayGuestStatusEnum("status").notNull().default("invited"),
    /** Permisos concretos del invitado: can_book_services, can_view_access… */
    permissions: jsonb("permissions").$type<Record<string, boolean>>().notNull().default({}),
    invitedBy: uuid("invited_by").references(() => users.id),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (t) => [index("stay_guests_stay_idx").on(t.stayId), index("stay_guests_user_idx").on(t.userId)],
);
