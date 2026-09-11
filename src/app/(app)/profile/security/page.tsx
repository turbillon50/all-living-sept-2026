import { UserProfile } from "@clerk/nextjs";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";

/** Pantalla 49: seguridad. Contraseña, sesiones y datos de acceso viven en Clerk. */
export default function SecurityPage() {
  return (
    <Page wide>
      <TopBar back="/profile" title="Seguridad y privacidad" />
      <div className="mt-6 overflow-x-auto">
        <UserProfile routing="hash" appearance={{ elements: { cardBox: "shadow-none w-full", rootBox: "w-full" } }} />
      </div>
    </Page>
  );
}
