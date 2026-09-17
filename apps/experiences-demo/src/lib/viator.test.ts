import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const taxonomy = { destinations: [{ destinationId: 76, name: "México", type: "COUNTRY", parentDestinationId: 8, lookupId: "8.76" }] };
const query = { destination: "76", q: "", date: "", currency: "MXN", sort: "recommended", cancellation: false, maxPrice: null, page: 1 };
beforeEach(() => { vi.resetModules(); vi.stubEnv("VIATOR_API_KEY", "test-only-secret"); vi.stubEnv("VIATOR_ENV", "production"); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("Viator failure semantics", () => {
  it("returns a genuine empty catalog only after a valid successful provider response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json(taxonomy)).mockResolvedValueOnce(Response.json({ products: [], totalCount: 0 })));
    const { search } = await import("./viator"); expect(await search(query)).toMatchObject({ items: [], total: 0, mode: "production" });
  });
  it("does not hide provider failure or malformed JSON as an empty destination", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(Response.json(taxonomy)).mockResolvedValueOnce(Response.json({ debug: "secret-provider-detail" }, { status: 503 })); vi.stubGlobal("fetch", fetch);
    const { search } = await import("./viator"); await expect(search(query)).rejects.toMatchObject({ status: 502 });
    fetch.mockResolvedValueOnce(Response.json(taxonomy)).mockResolvedValueOnce(Response.json({ products: [] })); await expect(search(query)).rejects.toMatchObject({ status: 502 });
  });
  it("respects a rate limit without retrying the provider repeatedly", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({}, { status: 429 })); vi.stubGlobal("fetch", fetch);
    const { search } = await import("./viator"); await expect(search(query)).rejects.toMatchObject({ status: 429 }); await expect(search(query)).rejects.toMatchObject({ status: 429 }); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("blocks invented destinations before product search and never exposes the API key", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(taxonomy)); vi.stubGlobal("fetch", fetch);
    const { search } = await import("./viator"); await expect(search({ ...query, destination: "999999" })).rejects.toMatchObject({ status: 400 }); expect(fetch).toHaveBeenCalledTimes(1);
  });
});
