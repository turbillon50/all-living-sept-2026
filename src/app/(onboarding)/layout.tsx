import { redirect } from "next/navigation";
import { getSessionUser } from "@/domains/identity/current-user";

export const dynamic = "force-dynamic";

/** Onboarding: exige sesión; si ya se completó, a la app. */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return <div className="min-h-dvh bg-bg">{children}</div>;
}
