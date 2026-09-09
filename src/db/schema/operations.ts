import { pgTable, text, uuid, integer, jsonb, timestamp, index, uniqueIndex, inet } from "drizzle-orm/pg-core";
import { base, demoFlag } from "./_base";
import {
  notificationTypeEnum,
  incidentPriorityEnum,
  incidentStatusEnum,
  accessTokenKindEnum,
  documentVisibilityEnum,
} from "./enums";
import { users } from "./identity";
import { properties } from "./properties";
import { fractions } from "./fractions";
import { stays } from "./stays";
import { providers } from "./providers";
import { serviceBookings } from "./bookings";

export const notifications = pgTable(
  "notifications",
  {
    ...base,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    /** Deep link hacia el objeto real: /stays/:id, /bookings/:id… */
    deepLink: text("deep_link"),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

export const incidents = pgTable(
  "incidents",
  {
    ...base,
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "restrict" }),
    stayId: uuid("stay_id").references(() => stays.id, { onDelete: "set null" }),
    reporterUserId: uuid("reporter_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: text("type").notNull(),
    priority: incidentPriorityEnum("priority").notNull().default("medium"),
    description: text("description").notNull(),
    media: jsonb("media").$type<string[]>().notNull().default([]),
    status: incidentStatusEnum("status").notNull().default("open"),
    assignedOperatorId: uuid("assigned_operator_id").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: text("resolution_note"),
  },
  (t) => [index("incidents_property_idx").on(t.propertyId, t.status), index("incidents_assigned_idx").on(t.assignedOperatorId, t.status)],
);

/** Tokens temporales firmados. El QR nunca lleva datos sensibles: solo el token. Se guarda el hash. */
export const accessTokens = pgTable(
  "access_tokens",
  {
    ...base,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stayId: uuid("stay_id").references(() => stays.id, { onDelete: "cascade" }),
    kind: accessTokenKindEnum("kind").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("access_tokens_hash_uq").on(t.tokenHash), index("access_tokens_user_idx").on(t.userId, t.kind)],
);

export const reviews = pgTable(
  "reviews",
  {
    ...base,
    ...demoFlag,
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => serviceBookings.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    rating: integer("rating").notNull(),
    body: text("body"),
  },
  (t) => [uniqueIndex("reviews_booking_uq").on(t.bookingId), index("reviews_provider_idx").on(t.providerId)],
);

export const documents = pgTable(
  "documents",
  {
    ...base,
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
    fractionId: uuid("fraction_id").references(() => fractions.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    hashSha256: text("hash_sha256"),
    visibility: documentVisibilityEnum("visibility").notNull().default("owner"),
    status: text("status").notNull().default("vigente"),
  },
  (t) => [index("documents_owner_idx").on(t.ownerUserId), index("documents_property_idx").on(t.propertyId)],
);

/** Auditoría: ownership, pagos, accesos, aprobación de proveedores, cambios de estado de semana. */
export const auditLogs = pgTable(
  "audit_logs",
  {
    ...base,
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: uuid("entity_id"),
    before: jsonb("before").$type<Record<string, unknown> | null>(),
    after: jsonb("after").$type<Record<string, unknown> | null>(),
    ip: inet("ip"),
  },
  (t) => [index("audit_logs_entity_idx").on(t.entity, t.entityId), index("audit_logs_actor_idx").on(t.actorUserId, t.createdAt)],
);

/** Outbox de eventos de dominio para integraciones futuras (Fraction Core, PMS, V&LIVING). */
export const domainEvents = pgTable(
  "domain_events",
  {
    ...base,
    name: text("name").notNull(),
    aggregate: text("aggregate").notNull(),
    aggregateId: uuid("aggregate_id"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [index("domain_events_unpublished_idx").on(t.publishedAt, t.occurredAt)],
);
