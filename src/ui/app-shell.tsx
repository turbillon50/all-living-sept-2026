import { ROLE_LABEL, type Role } from "@/core/roles";
import { GUEST_NAV, navFor } from "./nav";
import { Sidebar, TabBar } from "./tabbar";
import { ButtonLink } from "./button";
import { Mark } from "./mark";

/** Cascarón de la app autenticada: sidebar en escritorio, tabbar en móvil. */
export function AppShell({ role, name, children }: { role: Role; name: string; children: React.ReactNode }) {
  const items = navFor(role);
  return (
    <div className="flex min-h-dvh">
      <Sidebar items={items} name={name} contextLabel={ROLE_LABEL[role]} />
      <div className="min-w-0 flex-1">{children}</div>
      <TabBar items={items} />
    </div>
  );
}

/**
 * Cascarón del visitante: se explora sin cuenta. Misma navegación reducida,
 * y una barra discreta que invita a entrar sin bloquear nada.
 */
export function GuestShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar items={GUEST_NAV} name="Visitante" contextLabel="Explorando" />
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/85 px-4 py-2.5 backdrop-blur-md">
          <span className="inline-flex items-center gap-2.5">
            <Mark size={22} />
            <span className="font-serif text-[13px] uppercase tracking-[0.28em] text-text">All Living</span>
          </span>
          <ButtonLink href="/sign-in" size="sm" variant="primary">
            Entrar
          </ButtonLink>
        </div>
        {children}
      </div>
      <TabBar items={GUEST_NAV} />
    </div>
  );
}
