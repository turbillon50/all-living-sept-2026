import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { getSessionUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";
import { AuthFrame, clerkAppearance } from "@/domains/identity/auth-frame";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const user = await getSessionUser();
  if (user) redirect(homeFor(user.activeContext));
  return (
    <AuthFrame title="Crea tu cuenta">
      <SignUp forceRedirectUrl="/auth/complete" appearance={clerkAppearance} />
      <p className="mt-6 text-center text-sm text-text-2">¿Ya tienes cuenta? <Link href="/sign-in" className="font-medium text-green-900 underline underline-offset-4">Entrar</Link></p>
      <p className="mt-4 text-center text-sm"><Link href="/explore" className="text-text-2 underline underline-offset-4">Seguir explorando sin cuenta</Link></p>
    </AuthFrame>
  );
}
