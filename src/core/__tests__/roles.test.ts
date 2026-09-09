import { describe, expect, it } from "vitest";
import { homeFor, isRole, SELF_SERVICE_ROLES } from "../roles";

describe("roles", () => {
  it("homeFor manda a cada contexto a su inicio", () => {
    expect(homeFor("owner")).toBe("/home");
    expect(homeFor("guest")).toBe("/home");
    expect(homeFor("provider")).toBe("/pro");
    expect(homeFor("operator")).toBe("/ops");
    expect(homeFor("admin")).toBe("/admin");
  });
  it("isRole rechaza basura", () => {
    expect(isRole("owner")).toBe(true);
    expect(isRole("root")).toBe(false);
    expect(isRole(null)).toBe(false);
  });
  it("operator y admin nunca son de autoservicio", () => {
    expect(SELF_SERVICE_ROLES).not.toContain("operator");
    expect(SELF_SERVICE_ROLES).not.toContain("admin");
  });
});
