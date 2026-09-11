import { Check, Home, Compass, Briefcase, Wrench, ShieldCheck } from "@/ui/icons";
import { requireUser } from "@/domains/identity/current-user";
import { ROLE_LABEL, ROLES, SELF_SERVICE_ROLES, type Role } from "@/core/roles";
import { setMode } from "@/domains/identity/profile-actions";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { ButtonLink } from "@/ui/button";
import { cn } from "@/ui/cn";

const META: Record<Role, { body: string; Icon: typeof Home }> = {
  owner: { body: "Gestiona tus propiedades y fracciones.", Icon: Home },
  guest: { body: "Reserva estancias y servicios.", Icon: Compass },
  provider: { body: "Ofrece tus servicios.", Icon: Briefcase },
  operator: { body: "Administra propiedades (All Living Team).", Icon: Wrench },
  admin: { body: "Panel de administración.", Icon: ShieldCheck },
};

/** Pantalla 50: cambiar de rol. Un solo toque; persiste; sin cerrar sesión. */
export default async function ModePage() {
  const user = await requireUser();
  const available = ROLES.filter((r) => user.roles.includes(r));
  const addable = SELF_SERVICE_ROLES.filter((r) => !user.roles.includes(r));
  return (
    <Page>
      <TopBar back="/profile" title="Cambiar de rol" />
      <h1 className="pt-4 text-[30px] leading-[1.06]">Cambiar de rol</h1>
      <form className="mt-6 divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline overflow-hidden">
        {available.map((r) => { const active = r === user.activeContext; const { body, Icon } = META[r]; return (
          <button key={r} formAction={setMode.bind(null, r)} aria-pressed={active} className={cn("press flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-surface-2", active && "bg-accent-soft/60")}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-green-900"><Icon size={18} aria-hidden /></span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-medium">{ROLE_LABEL[r]}</span><span className="block text-[13px] text-text-2">{body}</span></span>
            {active ? <Check size={20} className="text-green-900" aria-hidden /> : null}
          </button>
        ); })}
      </form>
      {addable.includes("provider") ? <div className="mt-6"><ButtonLink href="/pro/onboarding" variant="secondary" size="lg">Quiero ser proveedor</ButtonLink></div> : null}
    </Page>
  );
}
