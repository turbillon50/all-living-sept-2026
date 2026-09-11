import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  ACCESS_TOKEN_SECRET: z.string().min(32).optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  MAPBOX_TOKEN: z.string().optional(),
  /** Correos que reciben admin+operator al primer acceso (separados por coma). */
  ADMIN_EMAILS: z.string().optional().transform((v) => (v ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)),
  SEED_DEMO: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/** Entorno validado una vez. Las llaves ausentes activan adaptadores locales, nunca simulaciones. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Entorno inválido: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProd = () => env().NODE_ENV === "production";
export const hasDb = () => Boolean(env().DATABASE_URL);
export const hasClerk = () => Boolean(env().NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env().CLERK_SECRET_KEY);
