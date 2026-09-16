import { afterEach, describe, expect, it, vi } from "vitest";
import { discoveryParams, normalizeTicketmasterEvent, parseFilters } from "./ticketmaster";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("Discovery contract", () => {
  it("validates inputs and sends search, classification, date and geography upstream", () => {
    const filters = parseFilters({ q: "  jazz  ", city: "playa-del-carmen", category: "Music", date: "2026-10-20" });
    const params = discoveryParams("playa-del-carmen", filters, true, new Date("2026-09-16T12:00:00Z"));
    expect(Object.fromEntries(params)).toMatchObject({ keyword: "jazz", city: "Playa del Carmen,Solidaridad", classificationName: "Music", countryCode: "MX", startDateTime: "2026-10-20T05:00:00Z" });
    expect(parseFilters({ date: "2026-02-30", city: "mexico", category: "lodging" })).toEqual({ q: "", city: "all", date: "", category: "all" });
  });
  it("only renders real dates and safe official purchase links", () => {
    const raw = { id: "e1", name: "Concierto", url: "https://www.ticketmaster.com.mx/event/e1", dates: { start: { localDate: "2026-10-20" } }, priceRanges: [{ min: 800, currency: "MXN" }] };
    expect(normalizeTicketmasterEvent(raw)?.price).toEqual({ min: 800, max: 800, currency: "MXN" });
    expect(normalizeTicketmasterEvent({ ...raw, url: "https://ticketmaster.com.mx.evil.example/pay" })).toBeNull();
    expect(normalizeTicketmasterEvent({ ...raw, dates: { start: { localDate: "2026-02-30" } } })).toBeNull();
  });
  it("maps valid venue coordinates and only official Spotify artist links", () => {
    const raw = { id: "event-map", name: "Music", url: "https://www.ticketmaster.com.mx/event/e1", dates: { start: { localDate: "2026-10-20" } }, _embedded: { venues: [{ location: { latitude: "21.1617", longitude: "-86.8517" } }], attractions: [{ name: "Jungle", externalLinks: { spotify: [{ url: "https://open.spotify.com/artist/59oA5WbbQvomJz2BuRG071" }] } }] } };
    expect(normalizeTicketmasterEvent(raw)).toMatchObject({ coordinates: [21.1617, -86.8517], artist: "Jungle", spotifyId: "59oA5WbbQvomJz2BuRG071" });
    expect(normalizeTicketmasterEvent({ ...raw, _embedded: { venues: [{ location: { latitude: "999", longitude: "-86.8517" } }], attractions: [{ externalLinks: { spotify: [{ url: "https://open.spotify.com.evil.example/artist/59oA5WbbQvomJz2BuRG071" }] } }] } })).toMatchObject({ coordinates: null, spotifyId: null });
  });
  it("returns a genuine empty result only after successful geographic and city queries", async () => {
    vi.resetModules(); vi.stubEnv("TICKETMASTER_API_KEY", "test-key");
    const fetcher = vi.fn().mockImplementation(async () => Response.json({ page: { totalElements: 0 } })); vi.stubGlobal("fetch", fetcher);
    const { getQuintanaRooEvents } = await import("./ticketmaster");
    const [result] = await getQuintanaRooEvents(parseFilters({ q: "jazz", city: "cancun" }));
    expect(result).toMatchObject({ isLive: true, error: null, events: [], totalAvailable: 0 });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([url]) => url.searchParams.get("keyword") === "jazz")).toBe(true);
    expect(fetcher.mock.calls[1][0].searchParams.get("city")).toBe("Cancún,Cancun");
  });
  it("propagates upstream failure as 503, not a successful empty catalog", async () => {
    vi.resetModules(); vi.stubEnv("TICKETMASTER_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 })));
    const { GET } = await import("../app/api/events/route");
    const response = await GET(new Request("https://events.alliving.live/api/events?city=tulum"));
    expect(response.status).toBe(503); expect(response.headers.get("cache-control")).toBe("no-store");
    const data = await response.json(); expect(data.ok).toBe(false); expect(data.places[0].isLive).toBe(false);
    expect(JSON.stringify(data)).not.toContain("test-key");
  });
  it("treats malformed upstream data as an error and stops during quota cooldown", async () => {
    vi.resetModules(); vi.stubEnv("TICKETMASTER_API_KEY", "test-key");
    const fetcher = vi.fn().mockResolvedValue(new Response("", { status: 429, headers: { "retry-after": "60" } })); vi.stubGlobal("fetch", fetcher);
    const { getQuintanaRooEvents } = await import("./ticketmaster");
    const places = await getQuintanaRooEvents();
    expect(places.every(place => !place.isLive && place.error)).toBe(true); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not disguise unexpected payloads as a city with zero events", async () => {
    vi.resetModules(); vi.stubEnv("TICKETMASTER_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "bad response" })));
    const { getQuintanaRooEvents } = await import("./ticketmaster");
    expect((await getQuintanaRooEvents(parseFilters({ city: "tulum" })))[0].isLive).toBe(false);
  });
});
