import { requireUser } from "@/domains/identity/current-user";
import { Page } from "@/ui/page";
import { Steps } from "@/domains/identity/onboarding-steps";
import { ProfileForm } from "./profile-form";

/** Pantalla 05: perfil básico. Nombre, teléfono opcional, idioma. */
export default async function ProfileStep() {
  const user = await requireUser();
  return (
    <Page>
      <div className="pt-10 pb-6 fade-up">
        <Steps current={1} />
        <h1 className="mt-6 text-[32px] leading-[1.08]">Cuéntanos de ti</h1>
        <p className="mt-2 text-text-2">Lo justo para recibirte bien. Lo demás lo completas cuando quieras.</p>
      </div>
      <ProfileForm defaults={{ name: user.name, locale: user.locale }} avatarUrl={user.avatarUrl} />
    </Page>
  );
}
