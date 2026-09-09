import { pgTable, text, uuid, integer, numeric, jsonb, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { base, demoFlag } from "./_base";
import { bookingStatusEnum, paymentStatusEnum, payoutStatusEnum } from "./enums";
import { users } from "./identity";
import { providers, providerServices } from "./providers";
import { stays } from "./stays";
import { properties } from "./properties";

export const serviceBookings = pgTable(
  "service_bookings",
  {
    ...base,
    ...demoFlag,
    serviceId: uuid("service_id")
      .notNull()
      .references(() => providerServices.id, { onDelete: "restrict" }),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "restrict" }),
    requesterUserId: uuid("requester_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    stayId: uuid("stay_id").references(() => stays.id, { onDelete: "set null" }),
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    people: integer("people").notNull().default(1),
    options: jsonb("options").$type<Array<{ key: string; label: string; price: number }>>().notNull().default([]),
    notes: text("notes"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    fees: numeric("fees", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("MXN"),
    status: bookingStatusEnum("status").notNull().default("requested"),
    /** Evidencia del proveedor al finalizar (fotos, nota). */
    evidence: jsonb("evidence").$type<Record<string, unknown>>().notNull().default({}),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("service_bookings_provider_idx").on(t.providerId, t.scheduledAt),
    index("service_bookings_requester_idx").on(t.requesterUserId, t.scheduledAt),
    index("service_bookings_stay_idx").on(t.stayId),
  ],
);

/** Historia de estados de cada booking. Append-only. */
export const bookingStatusHistory = pgTable(
  "booking_status_history",
  {
    ...base,
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => serviceBookings.id, { onDelete: "cascade" }),
    fromStatus: bookingStatusEnum("from_status"),
    toStatus: bookingStatusEnum("to_status").notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    note: text("note"),
  },
  (t) => [index("booking_status_history_booking_idx").on(t.bookingId, t.createdAt)],
);

export const payments = pgTable(
  "payments",
  {
    ...base,
    ...demoFlag,
    bookingId: uuid("booking_id").references(() => serviceBookings.id, { onDelete: "set null" }),
    payerUserId: uuid("payer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    /** Adaptador que procesó: local | stripe | mercadopago. */
    provider: text("provider").notNull().default("local"),
    providerRef: text("provider_ref"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("MXN"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    method: text("method"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [index("payments_booking_idx").on(t.bookingId), uniqueIndex("payments_provider_ref_uq").on(t.provider, t.providerRef)],
);

export const payouts = pgTable(
  "payouts",
  {
    ...base,
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("MXN"),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    status: payoutStatusEnum("status").notNull().default("scheduled"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    reference: text("reference"),
  },
  (t) => [index("payouts_provider_idx").on(t.providerId, t.periodStart)],
);
