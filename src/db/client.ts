import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Cliente de base de datos. Driver HTTP de Neon: sin pools, apto para funciones serverless.
 * Se instancia una vez por proceso; en edge/serverless cada invocación es barata.
 */
let cached: ReturnType<typeof create> | null = null;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está definida");
  return drizzle(neon(url), { schema, casing: "snake_case" });
}

export function db() {
  cached ??= create();
  return cached;
}

export type Db = ReturnType<typeof db>;
export { schema };
