import { describe, expect, it } from "vitest";
import { daysUntil, formatRange, money, firstName, parseDateOnly } from "../format";

describe("format", () => {
  it("formatRange en el mismo mes", () => {
    expect(formatRange("2026-12-20", "2026-12-27")).toBe("20–27 dic");
  });
  it("formatRange en meses distintos", () => {
    expect(formatRange("2027-02-27", "2027-03-06")).toBe("27 feb – 6 mar");
  });
  it("daysUntil cuenta días de calendario", () => {
    expect(daysUntil("2026-12-20", new Date("2026-12-08T23:00:00Z"))).toBe(12);
    expect(daysUntil("2026-12-20", new Date("2026-12-20T05:00:00Z"))).toBe(0);
  });
  it("money en MXN sin centavos", () => {
    expect(money(14800)).toMatch(/14,800/);
    expect(money("3200.00")).toMatch(/3,200/);
  });
  it("firstName", () => {
    expect(firstName("Luis García")).toBe("Luis");
    expect(firstName("  Ana  ")).toBe("Ana");
  });
  it("parseDateOnly no se mueve por zona horaria", () => {
    const d = parseDateOnly("2027-03-08");
    expect(d.getUTCFullYear()).toBe(2027);
    expect(d.getUTCMonth()).toBe(2);
    expect(d.getUTCDate()).toBe(8);
  });
});
