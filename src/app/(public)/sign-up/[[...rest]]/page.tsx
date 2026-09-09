import { SignUp } from "@clerk/nextjs";
import { AuthFrame } from "@/domains/identity/auth-frame";

export default function SignUpPage() {
  return (
    <AuthFrame title="Crea tu cuenta">
      <SignUp forceRedirectUrl="/onboarding/profile" appearance={{ elements: { cardBox: "shadow-none", card: "shadow-none bg-transparent px-0" } }} />
    </AuthFrame>
  );
}
