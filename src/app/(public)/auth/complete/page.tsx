import { redirect } from "next/navigation";
import { getSessionUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";

export const dynamic = "force-dynamic";

/**
 * Único punto de salida de Clerk/OAuth.
 * Una cuenta nueva entra inmediatamente como huésped. El onboarding deja de ser
 * una barrera de acceso: perfil, gustos y permisos se completan después, cuando aporten valor.
 */
export default async function AuthCompletePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  redirect(homeFor(user.activeContext));
}
