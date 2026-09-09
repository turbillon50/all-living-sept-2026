import { createHash } from "node:crypto";
import QRCode from "qrcode";
import { db, schema } from "@/db/client";
import { accessControl } from "@/integrations/access-control";

/** Emite un token firmado temporal, guarda solo su hash y devuelve el QR como SVG. */
export async function issueQr(input: { userId: string; kind: "living_pass" | "stay_access"; stayId?: string; memberId?: string; ttlSeconds: number }) {
  const token = await accessControl().issue({ sub: input.userId, kind: input.kind, stayId: input.stayId, memberId: input.memberId }, input.ttlSeconds);
  await db().insert(schema.accessTokens).values({
    userId: input.userId,
    stayId: input.stayId ?? null,
    kind: input.kind,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + input.ttlSeconds * 1000),
  });
  const svg = await QRCode.toString(token, { type: "svg", margin: 0, color: { dark: "#0f3d3a", light: "#0000" }, errorCorrectionLevel: "M" });
  return { svg };
}
