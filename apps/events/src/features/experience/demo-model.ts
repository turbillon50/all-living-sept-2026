import { DEMO_EVENTS } from "./catalog";
export type DemoProfile = { name: string; email: string; city: string; interests: string[]; avatar: string; bio: string };
export type CartItem = { key: string; eventId: string; date: string; zone: "General" | "Preferente" | "VIP"; quantity: number };
export type DemoOrder = { id: string; createdAt: string; items: CartItem[]; total: number; method: string };
export type DemoState = {
  version: 1; signedIn: boolean; profile: DemoProfile; favorites: string[]; cart: CartItem[]; orders: DemoOrder[];
  settings: { motion: boolean; activity: boolean; reminders: boolean }; mode: "demo" | "live";
};
export const INITIAL_STATE: DemoState = { version: 1, signedIn: false, profile: { name: "Alex Rivera", email: "alex@ejemplo.com", city: "cancun", interests: ["Música", "Festivales"], avatar: "AR", bio: "Siempre hay una buena razón para salir." }, favorites: [], cart: [], orders: [], settings: { motion: true, activity: true, reminders: false }, mode: "demo" };
export const ZONES = [{ id: "General", multiplier: 1, description: "Vívelo desde la pista" }, { id: "Preferente", multiplier: 1.4, description: "Más cerca del escenario" }, { id: "VIP", multiplier: 1.85, description: "Un lugar especial para ti" }] as const;
export function unitPrice(item: CartItem) { const event = DEMO_EVENTS.find(e => e.id === item.eventId); return event ? Math.round((event.price ?? 0) * (ZONES.find(z => z.id === item.zone)?.multiplier ?? 1)) : 0; }
export function validCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;
  const i = item as CartItem; const event = DEMO_EVENTS.find(e => e.id === i.eventId);
  return Boolean(event && event.dates.includes(i.date) && ZONES.some(z => z.id === i.zone) && Number.isInteger(i.quantity) && i.quantity >= 1 && i.quantity <= 6 && i.key === `${i.eventId}:${i.date}:${i.zone}`);
}
export function cartTotal(cart: CartItem[]) { return cart.filter(validCartItem).reduce((total, item) => total + unitPrice(item) * item.quantity, 0); }
export function addCartItem(cart: CartItem[], item: CartItem): CartItem[] {
  if (!validCartItem(item)) return cart;
  const existing = cart.find(i => i.key === item.key);
  return existing ? cart.map(i => i.key === item.key ? { ...i, quantity: Math.min(6, i.quantity + item.quantity) } : i) : [...cart, item].slice(0, 20);
}
export function createDemoOrder(cart: CartItem[], method: string, id: string, now: string): DemoOrder {
  if (!cart.length || cart.length > 20 || !cart.every(validCartItem) || !id.startsWith("DEMO-") || !["Tarjeta de prueba •••• 4242", "Transferencia simulada"].includes(method) || !Number.isFinite(Date.parse(now))) throw new Error("Selección de demostración no válida");
  return { id, createdAt: now, items: cart.map(item => ({ ...item })), total: cartTotal(cart), method };
}
export function restoreDemoState(raw: string): DemoState {
  const data = JSON.parse(raw) as Partial<DemoState>;
  if (data.version !== 1) return INITIAL_STATE;
  return {
    ...INITIAL_STATE, signedIn: data.signedIn === true, mode: data.mode === "live" ? "live" : "demo",
    profile: { ...INITIAL_STATE.profile, name: typeof data.profile?.name === "string" ? data.profile.name.slice(0, 60) : INITIAL_STATE.profile.name, email: typeof data.profile?.email === "string" ? data.profile.email.slice(0, 120) : INITIAL_STATE.profile.email, bio: typeof data.profile?.bio === "string" ? data.profile.bio.slice(0, 160) : INITIAL_STATE.profile.bio, city: ["cancun", "playa-del-carmen", "tulum"].includes(data.profile?.city ?? "") ? data.profile!.city : "cancun", avatar: typeof data.profile?.avatar === "string" ? data.profile.avatar.slice(0, 2) : "AR", interests: Array.isArray(data.profile?.interests) ? data.profile.interests.filter(x => typeof x === "string").slice(0, 8) : INITIAL_STATE.profile.interests },
    favorites: Array.isArray(data.favorites) ? data.favorites.filter(x => typeof x === "string").slice(0, 100) : [],
    cart: Array.isArray(data.cart) ? data.cart.filter(validCartItem).slice(0, 20) : [],
    orders: Array.isArray(data.orders) ? data.orders.filter(o => o && typeof o.id === "string" && o.id.startsWith("DEMO-") && typeof o.createdAt === "string" && Number.isFinite(Date.parse(o.createdAt)) && typeof o.method === "string" && Array.isArray(o.items) && o.items.length > 0 && o.items.every(validCartItem) && Number.isFinite(o.total) && o.total >= 0).slice(0, 30) : [],
    settings: { motion: data.settings?.motion !== false, activity: data.settings?.activity !== false, reminders: data.settings?.reminders === true },
  };
}
