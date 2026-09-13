import { cache } from "react";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { env, hasDb, hasClerk } from "@/core/env";
import { isRole, type Role, SELF_SERVICE_ROLES } from "@/core/roles";
import { unauthorized, forbidden } from "@/core/errors";

export type SessionUser = {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  locale: string;
  roles: Role[];
  activeContext: Role;
  onboardingDone: boolean;
  memberId: string;
  isDemo: boolean;
};

const CTX_COOKIE = "al_ctx";

function memberIdFrom(id: string): string {
  return `AL-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/**
 * Usuario de sesión: Clerk → fila en `users` (se crea al primer acceso) → roles y contexto.
 * Devuelve null si no hay sesión. Cacheado por request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!hasClerk() || !hasDb()) return null;
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const d = db();
  let row = await d.query.users.findFirst({ where: eq(schema.users.clerkId, clerkId) });

  if (!row) {
    const cu = await currentUser();
    if (!cu) return null;
    const primary = cu.primaryEmailAddress ?? cu.emailAddresses[0] ?? null;
    const email = primary?.emailAddress ?? `${clerkId}@sin-correo.local`;
    const emailVerified = primary?.verification?.status === "verified";
    const name = [cu.firstName, cu.lastName].filter(Boolean).join(" ") || cu.username || email.split("@")[0] || "Miembro";

    // OAuth puede devolver un clerkId distinto para una persona que ya existe en All Living.
    // Si el correo está VERIFICADO por Clerk, enlazamos esa identidad a la cuenta existente
    // en vez de intentar crear un duplicado que chocaría con users_email_uq y causaría un loop.
    if (emailVerified) {
      const existingByEmail = await d.query.users.findFirst({
        where: sql`lower(${schema.users.email}) = ${email.toLowerCase()}`,
      });
      if (existingByEmail) {
        const updated = await d
          .update(schema.users)
          .set({ clerkId, name: name || existingByEmail.name, avatarUrl: cu.imageUrl ?? existingByEmail.avatarUrl })
          .where(eq(schema.users.id, existingByEmail.id))
          .returning();
        row = updated[0] ?? existingByEmail;
      }
    }

    if (!row) {
      const inserted = await d
        .insert(schema.users)
        .values({ clerkId, email, name, avatarUrl: cu.imageUrl ?? null })
        .onConflictDoNothing()
        .returning();
      row = inserted[0] ?? (await d.query.users.findFirst({ where: eq(schema.users.clerkId, clerkId) }));
    }
    if (!row) return null;
    await d
      .insert(schema.userProfiles)
      .values({ userId: row.id, memberId: memberIdFrom(row.id) })
      .onConflictDoNothing();
    // Todo usuario nace como huésped: es el rol mínimo. Owner/provider se activan por titularidad o alta.
    await d.insert(schema.userRoles).values({ userId: row.id, role: "guest" }).onConflictDoNothing();
    if (env().ADMIN_EMAILS.includes(email.toLowerCase())) {
      await d.insert(schema.userRoles).values([{ userId: row.id, role: "admin" }, { userId: row.id, role: "operator" }, { userId: row.id, role: "owner" }]).onConflictDoNothing();
    }
  }

  const [roleRows, profile] = await Promise.all([
    d.query.userRoles.findMany({ where: eq(schema.userRoles.userId, row.id) }),
    d.query.userProfiles.findFirst({ where: eq(schema.userProfiles.userId, row.id) }),
  ]);
  const roles = roleRows.filter((r) => r.status === "active").map((r) => r.role);

  // Contexto activo: cookie (rápida) validada contra roles; respaldo en DB.
  const jar = await cookies();
  const fromCookie = jar.get(CTX_COOKIE)?.value;
  let activeContext: Role = isRole(fromCookie) && roles.includes(fromCookie) ? fromCookie : row.activeContext;
  // Viajar es el default de la casa: por cada administrador hay cien que quieren
  // hospedaje, vuelo y experiencia. Hospedar/ofrecer/operar se encienden al reclamarlos.
  if (!roles.includes(activeContext)) activeContext = roles.includes("guest") ? "guest" : (roles[0] ?? "guest");

  return {
    id: row.id,
    clerkId,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    locale: row.locale,
    roles,
    activeContext,
    onboardingDone: Boolean(profile?.onboardingCompletedAt),
    memberId: profile?.memberId ?? memberIdFrom(row.id),
    isDemo: row.isDemo,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw unauthorized();
  return u;
}

/** Exige un rol otorgado (no solo activo). Admin y operator nunca se autoasignan. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const u = await requireUser();
  if (!u.roles.includes(role)) throw forbidden();
  return u;
}

/** Cambia el contexto activo. Solo a roles que el usuario tiene. Persiste en cookie y en DB. */
export async function switchContext(userId: string, roles: Role[], next: Role) {
  if (!roles.includes(next)) throw forbidden("Ese modo no está disponible en tu cuenta.");
  const jar = await cookies();
  jar.set(CTX_COOKIE, next, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  await db().update(schema.users).set({ activeContext: next }).where(eq(schema.users.id, userId));
}

/** Otorga un rol de autoservicio (owner/guest/provider). Operator/admin solo por admin. */
export async function grantSelfServiceRole(userId: string, role: Role) {
  if (!SELF_SERVICE_ROLES.includes(role)) throw forbidden();
  await db().insert(schema.userRoles).values({ userId, role }).onConflictDoNothing();
}
