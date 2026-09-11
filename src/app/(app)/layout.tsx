import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/domains/identity/current-user";
import { AppShell, GuestShell } from "@/ui/app-shell";

export const dynamic = "force-dynamic";

/** Lo que se puede mirar sin cuenta. Operar sigue exigiendo sesión. */
const PUBLIC_PREFIXES = ["/explore", "/properties", "/services", "/providers"];

/** Zona de la app. Con sesión: cascarón de miembro. Sin sesión: solo lo público, como visitante. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    const pathname = (await headers()).get("x-pathname") ?? "";
    if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return <GuestShell>{children}</GuestShell>;
    }
    redirect("/sign-in");
  }
  if (!user.onboardingDone) redirect("/onboarding/profile");
  return (
    <AppShell role={user.activeContext} name={user.name}>
      {children}
    </AppShell>
  );
}
