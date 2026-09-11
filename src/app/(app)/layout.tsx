import { redirect } from "next/navigation";
import { getSessionUser } from "@/domains/identity/current-user";
import { AppShell } from "@/ui/app-shell";

export const dynamic = "force-dynamic";

/** Zona autenticada. Sin sesión → entrar. Sin onboarding → completarlo. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding/profile");
  return (
    <AppShell role={user.activeContext} name={user.name}>
      {children}
    </AppShell>
  );
}
