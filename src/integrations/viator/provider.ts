import "server-only";
import { env } from "@/core/env";
import { normalizeExperience, object, PAGE_SIZE, searchRequest, type Experience, type SearchInput, type SearchResult } from "./catalog";

export class ViatorUnavailable extends Error {
  constructor(public readonly status: number) { super("No pudimos consultar las experiencias. Vuelve a intentarlo en un momento."); }
}
export function viatorReady() { return Boolean(env().VIATOR_API_KEY); }

/** Only read-only search endpoints. This adapter cannot create or charge a booking. */
export async function searchExperiences(input: SearchInput): Promise<SearchResult> {
  if (!viatorReady()) throw new ViatorUnavailable(503);
  const mode = env().VIATOR_ENV;
  const base = mode === "production" ? "https://api.viator.com/partner" : "https://api.sandbox.viator.com/partner";
  const request = searchRequest(input);
  const response = await fetch(`${base}${request.path}?campaign-value=all-living-experiences`, {
    method: "POST",
    headers: { "exp-api-key": env().VIATOR_API_KEY!, Accept: "application/json;version=2.0", "Accept-Language": "es", "Content-Type": "application/json" },
    body: JSON.stringify(request.body), signal: AbortSignal.timeout(15000), next: { revalidate: 300 },
  });
  if (!response.ok) throw new ViatorUnavailable(response.status === 429 ? 429 : 502);
  const payload = object(await response.json());
  const data = input.q ? object(payload.products) : payload;
  const products = input.q ? data.results : data.products;
  if (!Array.isArray(products) || typeof data.totalCount !== "number" || !Number.isFinite(data.totalCount)) throw new ViatorUnavailable(502);
  const items = products.map(product => normalizeExperience(product, mode)).filter((product): product is Experience => product !== null);
  if (products.length && !items.length) throw new ViatorUnavailable(502);
  return { items, total: data.totalCount, page: input.page, pages: Math.min(1000, Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE))), mode, query: input };
}
