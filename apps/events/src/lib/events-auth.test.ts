import { describe, expect, it } from "vitest";
import { eventsAuthReady } from "./events-auth";
const key = (mode: string, host: string) => `pk_${mode}_${Buffer.from(`${host}$`).toString("base64")}`;
describe("Events authentication isolation", () => {
  it("accepts only the dedicated live instance in production", () => {
    expect(eventsAuthReady(key("live", "clerk.events.alliving.live"), "sk_live_example")).toBe(true);
    expect(eventsAuthReady(key("live", "clerk.alliving.live"), "sk_live_example")).toBe(false);
    expect(eventsAuthReady(key("live", "another.clerk.accounts.dev"), "sk_live_example")).toBe(false);
  });
  it("rejects the previous Marketplace instance, mismatched keys and missing configuration", () => {
    const development = key("test", "credible-foxhound-920.clerk.accounts.dev");
    expect(eventsAuthReady(development, "sk_test_example")).toBe(false);
    expect(eventsAuthReady(development, "sk_live_example")).toBe(false);
    expect(eventsAuthReady(key("live", "clerk.events.alliving.live"), "sk_test_example")).toBe(false);
    expect(eventsAuthReady(undefined, undefined)).toBe(false);
  });
});
