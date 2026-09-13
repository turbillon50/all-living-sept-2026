import type { Role } from "@/core/roles";

export type NavItem = { href: string; label: string; icon: "home" | "stays" | "explore" | "services" | "profile" | "earnings" | "jobs" | "tasks" | "properties" };

/** Navegación del visitante sin cuenta: solo lo que se puede mirar. */
export const GUEST_NAV: NavItem[] = [
  { href: "/explore", label: "Explorar", icon: "explore" },
  { href: "/properties", label: "Propiedades", icon: "properties" },
  { href: "/services", label: "Servicios", icon: "services" },
];

/** Navegación por contexto activo (spec §28). Operator y admin tienen la suya; admin nunca en tabbar pública. */
export function navFor(role: Role): NavItem[] {
  switch (role) {
    case "provider":
      return [
        { href: "/pro", label: "Inicio", icon: "home" },
        { href: "/pro/jobs", label: "Servicios", icon: "jobs" },
        { href: "/pro/earnings", label: "Ingresos", icon: "earnings" },
        { href: "/profile", label: "Perfil", icon: "profile" },
      ];
    case "operator":
    case "admin":
      // Staff/admin are capabilities, not the consumer shell. The member experience stays intact;
      // internal tools are entered explicitly from Profile and never replace All Living.
      return [
        { href: "/home", label: "Inicio", icon: "home" },
        { href: "/stays", label: "Estancias", icon: "stays" },
        { href: "/explore", label: "Explorar", icon: "explore" },
        { href: "/services", label: "Servicios", icon: "services" },
        { href: "/profile", label: "Perfil", icon: "profile" },
      ];
    default:
      return [
        { href: "/home", label: "Inicio", icon: "home" },
        { href: "/stays", label: "Estancias", icon: "stays" },
        { href: "/explore", label: "Explorar", icon: "explore" },
        { href: "/services", label: "Servicios", icon: "services" },
        { href: "/profile", label: "Perfil", icon: "profile" },
      ];
  }
}
