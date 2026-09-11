import { pgTable, text, uuid, timestamp, boolean, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { base, demoFlag } from "./_base";
import { roleEnum, roleStatusEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    ...base,
    ...demoFlag,
    clerkId: text("clerk_id").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    locale: text("locale").notNull().default("es-MX"),
    /** Contexto activo (modo) persistido: owner | guest | provider | operator | admin. */
    activeContext: roleEnum("active_context").notNull().default("owner"),
    /**
     * Vínculo opcional con la cuenta de V&LIVING. El registro es independiente
     * (bases separadas, doble alta); esto solo guarda el puente cuando el miembro
     * empareja las dos cuentas. Nunca se rellena solo por coincidencia de correo.
     */
    vlivingUserId: text("vliving_user_id"),
    linkedAt: timestamp("linked_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("users_clerk_id_uq").on(t.clerkId), uniqueIndex("users_email_uq").on(t.email)],
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    ...base,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    phone: text("phone"),
    bio: text("bio"),
    languages: jsonb("languages").$type<string[]>().notNull().default([]),
    interests: jsonb("interests").$type<string[]>().notNull().default([]),
    onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
    notificationsOptIn: boolean("notifications_opt_in").notNull().default(false),
    locationOptIn: boolean("location_opt_in").notNull().default(false),
    memberId: text("member_id").notNull(),
  },
  (t) => [uniqueIndex("user_profiles_user_uq").on(t.userId), uniqueIndex("user_profiles_member_id_uq").on(t.memberId)],
);

export const userRoles = pgTable(
  "user_roles",
  {
    ...base,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    status: roleStatusEnum("status").notNull().default("active"),
    /** Alcance opcional (p. ej. operator: property_ids). */
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull().default({}),
    grantedBy: uuid("granted_by").references(() => users.id),
  },
  (t) => [uniqueIndex("user_roles_user_role_uq").on(t.userId, t.role), index("user_roles_role_idx").on(t.role)],
);
