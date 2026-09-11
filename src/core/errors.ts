/** Errores de dominio con código estable; la UI los traduce a estados, nunca a páginas blancas. */
export class DomainError extends Error {
  constructor(
    public readonly code:
      | "unauthorized"
      | "forbidden"
      | "not_found"
      | "conflict"
      | "invalid"
      | "unavailable"
      | "payment_failed",
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const unauthorized = (m = "Inicia sesión para continuar.") => new DomainError("unauthorized", m);
export const forbidden = (m = "No tienes acceso a esto.") => new DomainError("forbidden", m);
export const notFound = (m = "No encontramos lo que buscas.") => new DomainError("not_found", m);
export const conflict = (m: string, d?: Record<string, unknown>) => new DomainError("conflict", m, d);
export const invalid = (m: string, d?: Record<string, unknown>) => new DomainError("invalid", m, d);
