import { SignIn } from "@clerk/nextjs";
import { AuthFrame } from "@/domains/identity/auth-frame";

export default function SignInPage() {
  return (
    <AuthFrame title="Bienvenido de vuelta">
      <SignIn forceRedirectUrl="/" appearance={{ elements: { cardBox: "shadow-none", card: "shadow-none bg-transparent px-0" } }} />
    </AuthFrame>
  );
}
