import { ROLE_LABEL, type Role } from "@/core/roles";
import { GUEST_NAV, navFor } from "./nav";
import { Sidebar, TabBar } from "./tabbar";
import { LivingButton } from "./living-button";
import { AppHeader } from "./app-header";

/** Cascarón de la app autenticada: sidebar en escritorio, tabbar en móvil. */
export function AppShell({ role, roles, name, children }: { role: Role; roles: Role[]; name: string; children: React.ReactNode }) {
  const items = navFor(role);
  return (
    <div className="flex min-h-dvh">
      <Sidebar items={items} name={name} contextLabel={ROLE_LABEL[role]} />
      <div className="min-w-0 flex-1"><AppHeader name={name} role={role} />{children}</div>
      <TabBar items={items} />
      <LivingButton role={role} roles={roles} />
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
      <div className="min-w-0 flex-1"><AppHeader name="Visitante" role="guest" guest />{children}</div>
      <TabBar items={GUEST_NAV} />
      <LivingButton role="guest" roles={["guest"]} guest />
    </div>
  );
}
