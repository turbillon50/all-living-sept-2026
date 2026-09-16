import { describe, expect, it } from "vitest";
import { DEMO_EVENTS } from "./catalog";
import { INITIAL_STATE, addCartItem, cartTotal, createDemoOrder, restoreDemoState, validCartItem, type CartItem } from "./demo-model";
const general: CartItem = { key: "demo-rufus:2026-11-14:General", eventId: "demo-rufus", date: "2026-11-14", zone: "General", quantity: 2 };
describe("Demo checkout boundary", () => {
  it("never accepts real Ticketmaster events, arbitrary dates, prices or quantities", () => {
    expect(validCartItem(general)).toBe(true);
    for (const patch of [{ eventId: "ticketmaster-123" }, { date: "2026-11-30" }, { zone: "Unauthorized" }, { quantity: 0 }, { quantity: 7 }, { quantity: 1.5 }, { key: "wrong" }]) expect(validCartItem({ ...general, ...patch })).toBe(false);
    expect(addCartItem([], { ...general, eventId: "real-event" })).toEqual([]);
    expect(cartTotal([{ ...general, price: 1 } as CartItem])).toBe(3700);
    expect(DEMO_EVENTS.every(event => event.source === "demo" && event.id.startsWith("demo-"))).toBe(true);
  });
  it("merges matching date and zone, caps quantity, and preserves separate selections", () => {
    const merged = addCartItem([general], { ...general, quantity: 5 });
    expect(merged).toEqual([{ ...general, quantity: 6 }]);
    const vip: CartItem = { ...general, key: "demo-rufus:2026-11-14:VIP", zone: "VIP", quantity: 1 };
    expect(addCartItem([general], vip)).toHaveLength(2);
    expect(cartTotal([general, vip])).toBe(7123);
  });
  it("creates a local demonstration receipt only for valid selections and test methods", () => {
    const order = createDemoOrder([general], "Tarjeta de prueba •••• 4242", "DEMO-12345", "2026-09-16T10:00:00Z");
    expect(order).toMatchObject({ id: "DEMO-12345", total: 3700 });
    expect(order.items[0]).not.toBe(general);
    expect(() => createDemoOrder([], order.method, order.id, order.createdAt)).toThrow();
    expect(() => createDemoOrder([general], "Real bank", order.id, order.createdAt)).toThrow();
    expect(() => createDemoOrder([{ ...general, eventId: "real-event" }], order.method, order.id, order.createdAt)).toThrow();
    expect(() => createDemoOrder([general], order.method, "TM-REAL", order.createdAt)).toThrow();
  });
  it("restores only versioned valid local demo state and rejects corrupted cart entries", () => {
    const restored = restoreDemoState(JSON.stringify({ ...INITIAL_STATE, signedIn: true, profile: { ...INITIAL_STATE.profile, name: "Luis", city: "bad-city" }, cart: [general, { ...general, quantity: 999 }], orders: [{ id: "REAL-123" }] }));
    expect(restored.profile).toMatchObject({ name: "Luis", city: "cancun" });
    expect(restored.cart).toEqual([general]); expect(restored.orders).toEqual([]);
    expect(restored.signedIn).toBe(true);
    expect(restoreDemoState('{"version":9}')).toEqual(INITIAL_STATE);
  });
});
