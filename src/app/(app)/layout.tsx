import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/domains/identity/current-user";
import { AppShell, GuestShell } from "@/ui/app-shell";

export const dynamic = "force-dynamic";

/**
 * Lo que se puede mirar sin cuenta. Operar sigue exigiendo sesión.
 * `/properties` a secas es "mis propiedades" (titularidad) y NO entra: solo su detalle,
 * que es la ficha a la que llevan las fotos de Explorar.
 */
const PUBLIC_PREFIXES = ["/explore", "/services", "/providers"];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/properties/")) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Zona de la app. Con sesión: cascarón de miembro. Sin sesión: solo lo público, como visitante. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    const pathname = (await headers()).get("x-pathname") ?? "";
    if (isPublicPath(pathname)) return <GuestShell>{children}</GuestShell>;
    redirect("/sign-in");
  }
  if (!user.onboardingDone) redirect("/onboarding/profile");
  return (
    <AppShell role={user.activeContext} name={user.name}>
      {children}
    </AppShell>
  );
}
