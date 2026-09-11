import { SignJWT, jwtVerify } from "jose";
import { env } from "@/core/env";

/**
 * Control de acceso: tokens temporales firmados (Living Pass, acceso a estancia).
 * No abre cerraduras físicas: eso requiere adaptador del fabricante (INTEGRATIONS.md).
 */
export type AccessClaims = {
  sub: string;
  kind: "living_pass" | "stay_access";
  stayId?: string;
  memberId?: string;
};

export interface AccessControlProvider {
  readonly name: string;
  readonly isLocal: boolean;
  issue(claims: AccessClaims, ttlSeconds: number): Promise<string>;
  verify(token: string): Promise<AccessClaims | null>;
  /** Apertura física: el local siempre responde que no hay cerradura conectada. */
  unlock(stayId: string): Promise<{ ok: boolean; reason?: string }>;
}

function secret(): Uint8Array {
  const s = env().ACCESS_TOKEN_SECRET ?? (env().NODE_ENV !== "production" ? "dev-secret-dev-secret-dev-secret-32" : undefined);
  if (!s) throw new Error("ACCESS_TOKEN_SECRET requerido en producción");
  return new TextEncoder().encode(s);
}

class LocalAccessControl implements AccessControlProvider {
  readonly name = "local";
  readonly isLocal = true;
  async issue(claims: AccessClaims, ttlSeconds: number) {
    return new SignJWT({ kind: claims.kind, stayId: claims.stayId, memberId: claims.memberId })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(claims.sub)
      .setIssuedAt()
      .setExpirationTime(`${ttlSeconds}s`)
      .sign(secret());
  }
  async verify(token: string) {
    try {
      const { payload } = await jwtVerify(token, secret());
      if (!payload.sub || typeof payload.kind !== "string") return null;
      return {
        sub: payload.sub,
        kind: payload.kind as AccessClaims["kind"],
        stayId: typeof payload.stayId === "string" ? payload.stayId : undefined,
        memberId: typeof payload.memberId === "string" ? payload.memberId : undefined,
      };
    } catch {
      return null;
    }
  }
  async unlock() {
    return { ok: false, reason: "sin_cerradura_conectada" };
  }
}

export function accessControl(): AccessControlProvider {
  return new LocalAccessControl();
}
