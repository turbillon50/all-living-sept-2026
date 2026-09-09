import { ROLE_LABEL, type Role } from "@/core/roles";
import { navFor } from "./nav";
import { Sidebar, TabBar } from "./tabbar";

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
