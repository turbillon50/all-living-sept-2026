import { pgTable, text, uuid, integer, boolean, numeric, date, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { base, demoFlag } from "./_base";
import { fractionStatusEnum, seasonEnum, weekStatusEnum } from "./enums";
import { properties } from "./properties";
import { users } from "./identity";

export const fractions = pgTable(
  "fractions",
  {
    ...base,
    ...demoFlag,
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "restrict" }),
    /** Código visible: F07. Único por propiedad. */
    code: text("code").notNull(),
    totalWeeks: integer("total_weeks").notNull().default(3),
    status: fractionStatusEnum("status").notNull().default("active"),
    /** Referencia al registro en Fraction Core / V&LIVING, si existe. */
    externalRef: text("external_ref"),
  },
  (t) => [uniqueIndex("fractions_property_code_uq").on(t.propertyId, t.code)],
);

/**
 * Historial de titularidad. Nunca se sobrescribe: una transferencia cierra la fila
 * (transferred_at, active=false) y abre otra. Solo UNA titularidad activa por fracción y share.
 */
export const fractionOwnerships = pgTable(
  "fraction_ownerships",
  {
    ...base,
    fractionId: uuid("fraction_id")
      .notNull()
      .references(() => fractions.id, { onDelete: "restrict" }),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    share: numeric("share", { precision: 5, scale: 4 }).notNull().default("1.0000"),
    acquiredAt: timestamp("acquired_at", { withTimezone: true }).notNull().defaultNow(),
    transferredAt: timestamp("transferred_at", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    source: text("source").notNull().default("fraction_core"),
  },
  (t) => [
    uniqueIndex("fraction_ownerships_active_uq")
      .on(t.fractionId)
      .where(sql`${t.active} = true`),
    index("fraction_ownerships_owner_idx").on(t.ownerUserId, t.active),
  ],
);

/** Derechos de uso por semana. Una semana no puede existir dos veces para la misma fracción. */
export const fractionWeeks = pgTable(
  "fraction_weeks",
  {
    ...base,
    fractionId: uuid("fraction_id")
      .notNull()
      .references(() => fractions.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    weekNumber: integer("week_number").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    season: seasonEnum("season").notNull(),
    status: weekStatusEnum("status").notNull().default("available"),
    /** Bloqueo de mantenimiento u operación: quién y por qué. */
    statusReason: text("status_reason"),
  },
  (t) => [
    uniqueIndex("fraction_weeks_fraction_start_uq").on(t.fractionId, t.startDate),
    uniqueIndex("fraction_weeks_fraction_year_week_uq").on(t.fractionId, t.year, t.weekNumber),
    index("fraction_weeks_start_idx").on(t.startDate),
  ],
);
