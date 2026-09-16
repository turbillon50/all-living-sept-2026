import type { Role } from "@/core/roles";

export type NavIcon = "home" | "stays" | "explore" | "services" | "profile" | "earnings" | "jobs" | "tasks" | "properties" | "flights" | "gifts";
export type NavItem = { href: string; label: string; icon: NavIcon };

/** Cuatro acciones + el Möbius al centro. Con tres items la rejilla queda coja. */
export const GUEST_NAV: NavItem[] = [
  { href: "/explore", label: "Hospedaje", icon: "explore" },
  { href: "/flights", label: "Vuelos", icon: "flights" },
  { href: "/tarjetas", label: "Tarjetas", icon: "gifts" },
  { href: "/services", label: "Vivir", icon: "services" },
];

/** Cuatro acciones por mundo. El quinto lugar móvil siempre pertenece al Möbius. */
export function navFor(role: Role): NavItem[] {
  switch (role) {
    case "owner":
      return [
        { href: "/properties", label: "Propiedades", icon: "properties" },
        { href: "/weeks", label: "Tiempo", icon: "stays" },
        { href: "/income", label: "Ingresos", icon: "earnings" },
        { href: "/profile", label: "Perfil", icon: "profile" },
      ];
    case "provider":
      return [
        { href: "/pro", label: "Negocio", icon: "home" },
        { href: "/pro/jobs", label: "Reservas", icon: "jobs" },
        { href: "/pro/services", label: "Servicios", icon: "services" },
        { href: "/profile", label: "Perfil", icon: "profile" },
      ];
    case "operator":
      return [
        { href: "/ops", label: "Hoy", icon: "home" },
        { href: "/stays", label: "Estancias", icon: "stays" },
        { href: "/ops/properties", label: "Propiedades", icon: "properties" },
        { href: "/profile", label: "Perfil", icon: "profile" },
      ];
    default:
      return [
        { href: "/explore", label: "Hospedaje", icon: "explore" },
        { href: "/flights", label: "Vuelos", icon: "flights" },
        { href: "/tarjetas", label: "Tarjetas", icon: "gifts" },
        { href: "/stays", label: "Viajes", icon: "stays" },
      ];
  }
}
