/** Roles de la plataforma. Una cuenta puede tener varios; uno está activo como contexto. */
export const ROLES = ["guest", "owner", "provider", "operator", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** Roles que el usuario puede activar desde Perfil → Cambiar modo. Operator y admin solo si se le otorgaron. */
export const SELF_SERVICE_ROLES: Role[] = ["guest", "owner", "provider"];

export const ROLE_LABEL: Record<Role, string> = {
  guest: "Viajero",
  owner: "Propietario",
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
    case "admin":
      // Internal permissions never hijack the member-facing product.
      return "/home";
    default:
      return "/home";
  }
}
