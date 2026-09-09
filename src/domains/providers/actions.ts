"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { requireUser, grantSelfServiceRole } from "@/domains/identity/current-user";
import { audit } from "@/core/events";
import { SERVICE_CATEGORIES } from "@/domains/services/categories";

export type ProviderActionState = { ok: boolean; error?: string } | null;

const catValues = SERVICE_CATEGORIES.map((c) => c.slug) as [string, ...string[]];
const onboardingSchema = z.object({
  kind: z.enum(["person", "company"]),
  businessName: z.string().trim().min(2).max(80),
  primaryCategory: z.enum(catValues),
  description: z.string().trim().min(20, "Cuéntanos un poco más (mínimo 20 caracteres).").max(600),
  contactPhone: z.string().trim().min(8).max(24),
  contactEmail: z.string().trim().email(),
  serviceName: z.string().trim().min(2).max(80),
  priceFrom: z.coerce.number().min(0).optional(),
  unit: z.enum(["servicio", "persona", "hora", "día", "trayecto", "salida", "sesión"]).default("servicio"),
});

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

/** Pantalla 38: alta de proveedor. Queda en submitted; nadie se publica solo. */
export async function submitProvider(_prev: ProviderActionState, form: FormData): Promise<ProviderActionState> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const zones = form.getAll("zone").map(String).filter(Boolean);
  if (zones.length === 0) return { ok: false, error: "Elige al menos una zona de servicio." };
  const d = parsed.data;
  const dbc = db();
  const existing = await dbc.query.providers.findFirst({ where: eq(schema.providers.userId, user.id) });
  if (existing && existing.status !== "draft" && existing.status !== "rejected") return { ok: false, error: "Ya tienes un perfil de proveedor en revisión o aprobado." };
  const base = slugify(d.businessName) || `proveedor-${user.id.slice(0, 6)}`;
  const slug = existing?.slug ?? `${base}-${user.id.slice(0, 4)}`;
  const values = { userId: user.id, kind: d.kind, businessName: d.businessName, slug, primaryCategory: d.primaryCategory as (typeof schema.serviceCategoryEnum.enumValues)[number], description: d.description, contactPhone: d.contactPhone, contactEmail: d.contactEmail, status: "submitted" as const };
  const [prov] = existing
    ? await dbc.update(schema.providers).set(values).where(eq(schema.providers.id, existing.id)).returning({ id: schema.providers.id })
    : await dbc.insert(schema.providers).values(values).returning({ id: schema.providers.id });
  if (!prov) return { ok: false, error: "No se pudo guardar." };
  await dbc.delete(schema.providerServiceAreas).where(eq(schema.providerServiceAreas.providerId, prov.id));
  await dbc.insert(schema.providerServiceAreas).values(zones.map((z) => ({ providerId: prov.id, destination: z })));
  const svc = await dbc.query.providerServices.findFirst({ where: eq(schema.providerServices.providerId, prov.id) });
  if (!svc) {
    await dbc.insert(schema.providerServices).values({ providerId: prov.id, category: values.primaryCategory, name: d.serviceName, priceFrom: d.priceFrom != null ? String(d.priceFrom) : null, unit: d.unit, active: true });
  }
  await grantSelfServiceRole(user.id, "provider");
  await audit({ actorUserId: user.id, action: "provider.submit", entity: "providers", entityId: prov.id, after: { status: "submitted" } });
  revalidatePath("/pro");
  redirect("/pro/verification");
}
