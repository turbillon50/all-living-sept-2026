import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { hasClerk, hasDb } from "@/core/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let database: "ok" | "sin_configurar" | "error" = "sin_configurar";
  if (hasDb()) {
    try {
      await Promise.race([db().execute(sql`select 1`), new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 4000))]);
      database = "ok";
    } catch {
      database = "error";
    }
  }
  const body = {
    ok: database !== "error",
    app: "all-living",
    version: process.env.npm_package_version ?? "0.1.0",
    database,
    auth: hasClerk() ? "ok" : "sin_configurar",
    latencyMs: Date.now() - started,
    time: new Date().toISOString(),
  };
  return Response.json(body, { status: body.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
