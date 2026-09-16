import { describe, expect, it } from "vitest";
import { eventsAuthReady } from "./events-auth";
const key = (mode: string, host: string) => `pk_${mode}_${Buffer.from(`${host}$`).toString("base64")}`;
describe("Events authentication isolation", () => {
  it("accepts only the dedicated live instance in production", () => {
    expect(eventsAuthReady(key("live", "clerk.events.alliving.live"), "sk_live_example", true)).toBe(true);
    expect(eventsAuthReady(key("live", "clerk.alliving.live"), "sk_live_example", true)).toBe(false);
    expect(eventsAuthReady(key("live", "another.clerk.accounts.dev"), "sk_live_example", true)).toBe(false);
  });
  it("never publishes development or mismatched keys as real production auth", () => {
    const development = key("test", "credible-foxhound-920.clerk.accounts.dev");
    expect(eventsAuthReady(development, "sk_test_example", true)).toBe(false);
    expect(eventsAuthReady(development, "sk_test_example", false)).toBe(true);
    expect(eventsAuthReady(development, "sk_live_example", false)).toBe(false);
    expect(eventsAuthReady(undefined, undefined, true)).toBe(false);
  });
});
