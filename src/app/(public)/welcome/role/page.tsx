import { Home, Compass, Briefcase } from "lucide-react";
import { TopBar } from "@/ui/top-bar";
import { Page } from "@/ui/page";
import { chooseIntent } from "@/domains/identity/onboarding-actions";

const OPTIONS = [
  { role: "owner", title: "Soy propietario", body: "Tengo una propiedad o una fracción y quiero vivirla.", Icon: Home },
  { role: "guest", title: "Soy huésped", body: "Me invitaron a una estancia o quiero explorar destinos.", Icon: Compass },
  { role: "provider", title: "Soy proveedor", body: "Ofrezco servicios y quiero trabajar con All Living.", Icon: Briefcase },
] as const;

/** Pantalla 03: ¿cómo quieres vivir All Living? Se pueden sumar más modos después. */
export default function RolePage() {
  return (
    <Page>
      <TopBar back="/welcome" />
      <div className="pt-6 pb-8 fade-up">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">Para empezar</p>
        <h1 className="mt-2 text-[32px] leading-[1.08] md:text-[40px]">¿Cómo quieres vivir All Living?</h1>
        <p className="mt-3 text-text-2">Puedes elegir varios más adelante desde tu perfil.</p>
      </div>
      <form className="flex flex-col gap-3">
        {OPTIONS.map(({ role, title, body, Icon }) => (
          <button
            key={role}
            formAction={chooseIntent.bind(null, role)}
            className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-4 text-left hover:bg-surface-2 transition-colors"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-green-900">
              <Icon size={20} strokeWidth={1.8} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-medium">{title}</span>
              <span className="block text-sm text-text-2">{body}</span>
            </span>
          </button>
        ))}
      </form>
    </Page>
  );
}
