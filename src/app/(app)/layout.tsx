import { getSessionUser } from "@/domains/identity/current-user";
import { AppShell, GuestShell } from "@/ui/app-shell";

export const dynamic = "force-dynamic";

/**
 * Zona de producto: explorar nunca se bloquea por no tener cuenta ni por onboarding.
 * Las acciones privadas siguen protegidas por Clerk/proxy y por requireUser/requireRole.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) return <GuestShell>{children}</GuestShell>;
  return <AppShell role={user.activeContext} roles={user.roles} name={user.name}>{children}</AppShell>;
}
