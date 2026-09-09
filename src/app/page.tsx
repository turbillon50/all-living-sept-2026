import { getSessionUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";
import { Splash } from "./splash";

export const dynamic = "force-dynamic";

/** Pantalla 01: el anillo. Con sesión → home del contexto; sin sesión → brand moment. */
export default async function Root() {
  const user = await getSessionUser();
  const target = !user ? "/welcome" : !user.onboardingDone ? "/onboarding/profile" : homeFor(user.activeContext);
  return <Splash target={target} />;
}
