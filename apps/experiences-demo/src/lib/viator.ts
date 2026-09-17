import "server-only";
import { normalizeDestinations, normalizeDetail, normalizeProduct, PAGE_SIZE, record, requestFor, type CatalogResult, type Destination, type Experience, type Mode, type SearchInput } from "./catalog";
export class CatalogError extends Error {
  constructor(public readonly status: number, message = "No pudimos consultar Viator. Vuelve a intentarlo en un momento.") { super(message); }
}
function config() {
  const key = process.env.VIATOR_API_KEY, mode = process.env.VIATOR_ENV;
  if (!key || !["production", "sandbox"].includes(mode ?? "")) throw new CatalogError(503, "El catálogo está temporalmente fuera de servicio.");
  return { key, mode: mode as Mode, base: mode === "production" ? "https://api.viator.com/partner" : "https://api.sandbox.viator.com/partner" };
}
let retryAfter = 0;
async function read(path: string, body?: unknown, revalidate = 300) {
  if (retryAfter > Date.now()) throw new CatalogError(429, "Hay muchas consultas en este momento. Intenta de nuevo en un minuto.");
  const c = config();
  let response: Response;
  try { response = await fetch(c.base + path, { method: body ? "POST" : "GET", headers: {
    "exp-api-key": c.key, Accept: "application/json;version=2.0", "Accept-Language": "es", ...(body ? { "Content-Type": "application/json" } : {}),
  }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(18000), next: { revalidate } }); }
  catch { throw new CatalogError(502); }
  if (response.status === 429) { retryAfter = Date.now() + 60000; throw new CatalogError(429, "Hay muchas consultas en este momento. Intenta de nuevo en un minuto."); }
  if (!response.ok) throw new CatalogError(response.status === 404 ? 404 : 502);
  try { return await response.json() as unknown; } catch { throw new CatalogError(502); }
}
export async function destinations(): Promise<Destination[]> { return normalizeDestinations(await read("/destinations", undefined, 86400)); }
export async function search(input: SearchInput): Promise<CatalogResult> {
  const taxonomy = await destinations();
  const place = taxonomy.find(d => d.id === input.destination);
  // The Caribbean continent (4) is returned as parent/lookup path, not as a row.
  if (!place && !(input.destination === "4" && taxonomy.some(d => d.path[0] === "4"))) throw new CatalogError(400, "Elige un destino disponible en el catálogo.");
  const request = requestFor(input), payload = record(await read(request.path + "?campaign-value=all-living-catalog", request.body));
  const data = input.q ? record(payload.products) : payload, products = input.q ? data.results : data.products;
  if (!Array.isArray(products) || typeof data.totalCount !== "number" || !Number.isFinite(data.totalCount) || data.totalCount < 0) throw new CatalogError(502);
  const mode = config().mode;
  const items = products.map(p => normalizeProduct(p, mode)).filter((p): p is Experience => p !== null);
  if (products.length > 0 && items.length === 0) throw new CatalogError(502);
  return { items, total: data.totalCount, page: input.page, pages: Math.min(10000, Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE))), mode, query: input, destination: place?.name ?? "Caribe" };
}
export async function detail(id: string) {
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) throw new CatalogError(400, "La experiencia no es válida.");
  const result = normalizeDetail(await read(`/products/${encodeURIComponent(id)}?campaign-value=all-living-catalog`, undefined, 300), config().mode);
  if (!result) throw new CatalogError(404, "Esta experiencia ya no está disponible. Consulta otras opciones.");
  return result;
}
