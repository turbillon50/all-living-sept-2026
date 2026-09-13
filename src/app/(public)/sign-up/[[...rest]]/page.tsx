import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { AuthFrame, clerkAppearance } from "@/domains/identity/auth-frame";

export default function SignUpPage() {
  return (
    <AuthFrame title="Crea tu cuenta">
      <SignUp forceRedirectUrl="/auth/complete" appearance={clerkAppearance} />
      <p className="mt-6 text-center text-sm text-text-2">¿Ya tienes cuenta? <Link href="/sign-in" className="font-medium text-green-900 underline underline-offset-4">Entrar</Link></p>
    </AuthFrame>
  );
}
