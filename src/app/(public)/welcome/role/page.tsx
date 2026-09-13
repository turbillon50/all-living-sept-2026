import Link from "next/link";
import { Home, Compass, Briefcase } from "@/ui/icons";
import { TopBar } from "@/ui/top-bar";
import { Page } from "@/ui/page";
import { chooseIntent } from "@/domains/identity/onboarding-actions";

const OPTIONS = [
  { role: "owner", title: "Tengo una propiedad o fracción", body: "Gestiona semanas, estancias, renta y operación.", Icon: Home },
  { role: "guest", title: "Quiero viajar", body: "Hospedaje, vuelos, experiencias y servicios.", Icon: Compass },
  { role: "provider", title: "Quiero ofrecer servicios", body: "Yates, chefs, transporte, wellness y más.", Icon: Briefcase },
] as const;

/** Elección opcional de intención. Nunca bloquea explorar ni crear una cuenta. */
export default function RolePage() {
  return (
    <Page>
      <TopBar back="/welcome" />
      <div className="pt-4 pb-8 fade-up">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Opcional</p>
        <h1 className="mt-2 text-[32px] leading-[1.08] md:text-[40px]">¿Qué quieres hacer primero?</h1>
        <p className="mt-2 text-text-2">Puedes cambiar de modo después. Esto no limita lo que puedes explorar.</p>
      </div>
      <form className="flex flex-col gap-3">
        {OPTIONS.map(({ role, title, body, Icon }) => (
          <button key={role} formAction={chooseIntent.bind(null, role)} className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-4 text-left hover:bg-surface-2 transition-colors">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface hairline text-green-900"><Icon size={20} aria-hidden /></span>
            <span className="min-w-0"><span className="block font-medium">{title}</span><span className="block text-[13px] text-text-2">{body}</span></span>
          </button>
        ))}
      </form>
      <div className="mt-6 text-center"><Link href="/explore" className="text-sm text-text-2 underline underline-offset-4">Ahora sólo quiero explorar</Link></div>
    </Page>
  );
}
