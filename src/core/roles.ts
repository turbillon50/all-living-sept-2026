/** Roles de la plataforma. Una cuenta puede tener varios; uno está activo como contexto. */
export const ROLES = ["owner", "guest", "provider", "operator", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** Roles que el usuario puede activar desde Perfil → Cambiar modo. Operator y admin solo si se le otorgaron. */
export const SELF_SERVICE_ROLES: Role[] = ["owner", "guest", "provider"];

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Propietario",
  guest: "Huésped",
  provider: "Proveedor",
  operator: "Operación",
  admin: "Administración",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Ruta de inicio por contexto activo. */
export function homeFor(role: Role): string {
  switch (role) {
    case "provider":
      return "/pro";
    case "operator":
      return "/ops";
    case "admin":
      return "/admin";
    default:
      return "/home";
  }
}
