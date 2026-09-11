import type { Role } from "@/core/roles";

export type NavItem = { href: string; label: string; icon: "home" | "stays" | "explore" | "services" | "profile" | "earnings" | "jobs" | "tasks" | "properties" };

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
      return [
        { href: "/ops", label: "Hoy", icon: "home" },
        { href: "/ops/tasks", label: "Tareas", icon: "tasks" },
        { href: "/ops/properties", label: "Propiedades", icon: "properties" },
        { href: "/profile", label: "Perfil", icon: "profile" },
      ];
    case "admin":
      return [
        { href: "/admin", label: "Admin", icon: "home" },
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
