import { redirect } from "next/navigation";
import { getSessionUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";

export const dynamic = "force-dynamic";

/** Onboarding: exige sesión; si ya se completó, a la app. */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.onboardingDone) redirect(homeFor(user.activeContext));
  return <div className="min-h-dvh bg-bg">{children}</div>;
}
