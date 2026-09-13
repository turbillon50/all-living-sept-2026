import { redirect } from "next/navigation";
import { getSessionUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";

export const dynamic = "force-dynamic";

/**
 * Único punto de salida de Clerk/OAuth.
 * Evita loops entre SignIn/SignUp, raíz y onboarding cuando Google/X
 * resuelven una cuenta existente o una cuenta nueva de forma distinta.
 */
export default async function AuthCompletePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding/profile");
  redirect(homeFor(user.activeContext));
}
