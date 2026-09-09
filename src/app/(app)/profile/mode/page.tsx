import { Check } from "lucide-react";
import { requireUser } from "@/domains/identity/current-user";
import { ROLE_LABEL, ROLES, SELF_SERVICE_ROLES } from "@/core/roles";
import { setMode } from "@/domains/identity/profile-actions";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { cn } from "@/ui/cn";

const BODY: Record<string, string> = {
  owner: "Tus propiedades, semanas y estancias.",
  guest: "Las estancias a las que te invitaron.",
  provider: "Tu agenda, tus servicios y tus ingresos.",
  operator: "Check-ins, limpiezas e incidencias de hoy.",
  admin: "Panel de administración.",
};

/** Pantalla 50: cambiar modo. Se siente como cambiar de contexto, no como cerrar sesión. */
export default async function ModePage() {
  const user = await requireUser();
  const available = ROLES.filter((r) => user.roles.includes(r));
  const addable = SELF_SERVICE_ROLES.filter((r) => !user.roles.includes(r));
  return (
    <Page>
      <TopBar back="/profile" title="Cambiar modo" />
      <p className="mt-6 text-text-2">Una sola cuenta, varios modos. Elige desde dónde quieres ver All Living hoy.</p>
      <form className="mt-6 flex flex-col gap-2.5">
        {available.map((r) => {
          const active = r === user.activeContext;
          return (
            <button
              key={r}
              name="role"
              value={r}
              formAction={setMode}
              className={cn("press flex items-center gap-4 rounded-[var(--radius-card)] p-4 text-left hairline transition-colors", active ? "bg-accent-soft border-green-100" : "bg-surface hover:bg-surface-2")}
              aria-pressed={active}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{ROLE_LABEL[r]}</span>
                <span className="block text-sm text-text-2">{BODY[r]}</span>
              </span>
              {active ? <Check size={20} className="text-green-900" aria-hidden /> : null}
            </button>
          );
        })}
      </form>
      {addable.length > 0 ? (
        <p className="mt-6 text-sm text-text-2">
          ¿Quieres sumar otro modo? {addable.includes("provider") ? <a href="/pro/onboarding" className="text-green-900 underline underline-offset-4">Trabajar con All Living como proveedor</a> : null}
        </p>
      ) : null}
    </Page>
  );
}
