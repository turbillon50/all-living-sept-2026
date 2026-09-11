import { describe, expect, it } from "vitest";
import { accessControl } from "..";

describe("access tokens", () => {
  it("emite y verifica un token firmado sin datos sensibles", async () => {
    const ac = accessControl();
    const token = await ac.issue({ sub: "user-1", kind: "living_pass", memberId: "AL-DEMO0001" }, 60);
    expect(token.split(".")).toHaveLength(3);
    expect(token).not.toContain("user-1");
    const claims = await ac.verify(token);
    expect(claims?.sub).toBe("user-1");
    expect(claims?.kind).toBe("living_pass");
  });
  it("rechaza tokens expirados o alterados", async () => {
    const ac = accessControl();
    const expired = await ac.issue({ sub: "u", kind: "stay_access", stayId: "s" }, -10);
    expect(await ac.verify(expired)).toBeNull();
    const ok = await ac.issue({ sub: "u", kind: "stay_access", stayId: "s" }, 60);
    expect(await ac.verify(ok + "x")).toBeNull();
  });
  it("nunca finge abrir una cerradura", async () => {
    const r = await accessControl().unlock("stay-1");
    expect(r.ok).toBe(false);
  });
});
