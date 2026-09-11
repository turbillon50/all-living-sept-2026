import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { AuthFrame, clerkAppearance } from "@/domains/identity/auth-frame";

export default function SignInPage() {
  return (
    <AuthFrame title="Bienvenido de vuelta">
      <SignIn forceRedirectUrl="/" appearance={clerkAppearance} />
      <p className="mt-6 text-center text-sm text-text-2">¿No tienes cuenta? <Link href="/sign-up" className="font-medium text-green-900 underline underline-offset-4">Crear cuenta</Link></p>
    </AuthFrame>
  );
}
