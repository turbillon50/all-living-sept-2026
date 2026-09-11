import { timestamp, uuid, boolean } from "drizzle-orm/pg-core";

/** Campos base de toda tabla: id UUID, created_at, updated_at. */
export const base = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Marca interna de datos demo. Nunca se muestra como dato real. */
export const demoFlag = { isDemo: boolean("is_demo").notNull().default(false) };
