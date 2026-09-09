import { Home, Compass, Briefcase } from "lucide-react";
import { TopBar } from "@/ui/top-bar";
import { Page } from "@/ui/page";
import { chooseIntent } from "@/domains/identity/onboarding-actions";

const OPTIONS = [
  { role: "owner", title: "Propietario", body: "Gestiona tus fracciones, reservas y beneficios.", Icon: Home },
  { role: "guest", title: "Huésped", body: "Vive estancias únicas en nuestras propiedades.", Icon: Compass },
  { role: "provider", title: "Proveedor", body: "Ofrece tus servicios y crece con nosotros.", Icon: Briefcase },
] as const;

/** Pantalla 03: ¿cómo quieres vivir All Living? Podrás cambiar el rol después. */
export default function RolePage() {
  return (
    <Page>
      <TopBar back="/welcome" />
      <div className="pt-4 pb-8 fade-up">
        <h1 className="text-[32px] leading-[1.08] md:text-[40px]">¿Cómo quieres vivir All Living?</h1>
      </div>
      <form className="flex flex-col gap-3">
        {OPTIONS.map(({ role, title, body, Icon }) => (
          <button key={role} formAction={chooseIntent.bind(null, role)} className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-4 text-left hover:bg-surface-2 transition-colors">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface hairline text-green-900"><Icon size={20} strokeWidth={1.7} aria-hidden /></span>
            <span className="min-w-0"><span className="block font-medium">{title}</span><span className="block text-[13px] text-text-2">{body}</span></span>
          </button>
        ))}
      </form>
      <p className="mt-6 text-center text-[12px] text-muted">Podrás cambiar el rol después.</p>
    </Page>
  );
}
