import Link from "next/link";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { getSessionUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";
import { AuthFrame, clerkAppearance } from "@/domains/identity/auth-frame";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect(homeFor(user.activeContext));
  return (
    <AuthFrame title="Bienvenido de vuelta">
      <SignIn forceRedirectUrl="/auth/complete" appearance={clerkAppearance} />
      <p className="mt-6 text-center text-sm text-text-2">¿No tienes cuenta? <Link href="/sign-up" className="font-medium text-green-900 underline underline-offset-4">Crear cuenta</Link></p>
      <p className="mt-4 text-center text-sm"><Link href="/explore" className="text-text-2 underline underline-offset-4">Seguir explorando sin cuenta</Link></p>
    </AuthFrame>
  );
}
