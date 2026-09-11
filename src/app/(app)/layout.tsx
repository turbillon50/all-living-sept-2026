import { redirect } from "next/navigation";
import { getSessionUser } from "@/domains/identity/current-user";
import { AppShell, GuestShell } from "@/ui/app-shell";

export const dynamic = "force-dynamic";

/**
 * Zona de la app.
 * Con sesión: cascarón de miembro. Sin sesión: cascarón de visitante.
 *
 * El layout no decide qué es público: eso lo decide el proxy (`isProtected`). Si una
 * página llegó hasta aquí sin sesión es porque se puede mirar sin cuenta. Las pocas
 * pantallas privadas que no pasan por el proxy (como /properties) redirigen ellas mismas.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) return <GuestShell>{children}</GuestShell>;
  if (!user.onboardingDone) redirect("/onboarding/profile");
  return (
    <AppShell role={user.activeContext} name={user.name}>
      {children}
    </AppShell>
  );
}
