export const PAGE_SIZE = 18;
export type Mode = "production" | "sandbox";
export type Destination = { id: string; name: string; type: string; parent: string; path: string[]; country: string };
export const MARKETS = [
  { id: "76", name: "México", code: "MX", subtitle: "Mucho por vivir" },
  { id: "78", name: "Argentina", code: "AR", subtitle: "De norte a sur" },
  { id: "4497", name: "Colombia", code: "CO", subtitle: "Siente el ritmo" },
  { id: "67", name: "España", code: "ES", subtitle: "Sal a descubrir" },
  { id: "4", name: "Caribe", code: "CAR", subtitle: "Entre islas y mar" },
  { id: "662", name: "Miami", code: "US", subtitle: "Cambia de escenario" },
] as const;
export type SearchInput = { destination: string; q: string; date: string; currency: string; sort: string; cancellation: boolean; maxPrice: number | null; page: number };
export const DEFAULT_SEARCH: SearchInput = { destination: "76", q: "", date: "", currency: "MXN", sort: "recommended", cancellation: false, maxPrice: null, page: 1 };
export type Experience = {
  id: string; title: string; description: string; image: string | null; url: string; destination: string;
  fromPrice: number | null; currency: string | null; extraCharges: number | null;
  rating: number | null; reviews: number; sources: string[]; duration: string | null; freeCancellation: boolean;
};
export type Detail = { id: string; title: string; description: string; images: string[]; url: string; inclusions: string[]; exclusions: string[]; additionalInfo: string[]; cancellation: string; pricingType: string; supplier: string };
export type CatalogResult = { items: Experience[]; total: number; page: number; pages: number; mode: Mode; query: SearchInput; destination: string };
export const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const rows = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (value: unknown) => typeof value === "string" ? value : "";
const num = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

export function parseSearch(values: URLSearchParams): SearchInput {
  const get = (key: string, fallback: string) => values.get(key) ?? fallback;
  const destination = get("destination", "76"), q = get("q", "").trim(), date = get("date", "");
  const currency = get("currency", "MXN"), sort = get("sort", "recommended"), cancellation = get("cancellation", "false");
  const page = Number(get("page", "1")), rawPrice = get("maxPrice", ""), maxPrice = rawPrice === "" ? null : Number(rawPrice);
  if (!/^\d{1,8}$/.test(destination) || Number(destination) < 1) throw new Error("Elige un destino del catálogo.");
  if (q.length > 100) throw new Error("La búsqueda admite hasta 100 caracteres.");
  if (!["MXN", "USD", "EUR"].includes(currency) || !["recommended", "price", "rating", "duration"].includes(sort)) throw new Error("Revisa la moneda y el orden de tu búsqueda.");
  if (!["false", "true"].includes(cancellation)) throw new Error("Revisa el filtro de cancelación.");
  if (!Number.isInteger(page) || page < 1 || page > 10000) throw new Error("Esta página no es válida.");
  if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice <= 0 || maxPrice > 1000000)) throw new Error("Indica un presupuesto mayor que cero.");
  if (date) {
    const parsed = new Date(date + "T00:00:00Z");
    // Allow today's date in the westernmost destination; Viator validates the supplier's local date.
    const earliest = new Date(Date.now() - 14 * 3600000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < earliest) throw new Error("Elige una fecha válida que no esté en el pasado.");
  }
  return { destination, q, date, currency, sort, cancellation: cancellation === "true", maxPrice, page };
}
export function searchParams(input: SearchInput) {
  return new URLSearchParams({ destination: input.destination, q: input.q, date: input.date, currency: input.currency, sort: input.sort, cancellation: String(input.cancellation), maxPrice: input.maxPrice === null ? "" : String(input.maxPrice), page: String(input.page) });
}
export function requestFor(input: SearchInput) {
  const sorting = input.sort === "price" ? { sort: "PRICE", order: "ASCENDING" }
    : input.sort === "rating" ? input.q ? { sort: "REVIEW_AVG_RATING" } : { sort: "TRAVELER_RATING", order: "DESCENDING" }
      : input.sort === "duration" ? { sort: "ITINERARY_DURATION", order: "ASCENDING" } : { sort: "DEFAULT" };
  const flags = input.cancellation ? { flags: ["FREE_CANCELLATION"] } : {};
  const pagination = { start: (input.page - 1) * PAGE_SIZE + 1, count: PAGE_SIZE };
  if (input.q) return { path: "/search/freetext", body: {
    searchTerm: input.q, currency: input.currency, productSorting: sorting,
    productFiltering: { destination: input.destination, ...flags, ...(input.date ? { dateRange: { from: input.date, to: input.date } } : {}), ...(input.maxPrice !== null ? { price: { to: input.maxPrice } } : {}) },
    searchTypes: [{ searchType: "PRODUCTS", pagination }],
  } };
  return { path: "/products/search", body: {
    filtering: { destination: input.destination, ...flags, ...(input.date ? { startDate: input.date, endDate: input.date } : {}), ...(input.maxPrice !== null ? { highestPrice: input.maxPrice } : {}) },
    sorting, pagination, currency: input.currency,
  } };
}
export function purchaseUrl(value: unknown, mode: Mode) {
  try { const url = new URL(str(value)); const hosts = mode === "production" ? ["www.viator.com", "viator.com"] : ["shop.live.rc.viator.com", "www.viator.com"];
    return url.protocol === "https:" && !url.username && !url.password && !url.port && hosts.includes(url.hostname) ? url.href : null;
  } catch { return null; }
}
export function imageUrl(value: unknown) {
  try { const url = new URL(str(value)); return url.protocol === "https:" && !url.username && !url.password && ["media.tacdn.com", "media-cdn.tripadvisor.com", "hare-media-cdn.tripadvisor.com", "dynamic-media-cdn.tripadvisor.com"].includes(url.hostname) ? url.href : null; }
  catch { return null; }
}
function imagesFrom(value: unknown): string[] {
  return rows(value).map(record).sort((a, b) => Number(b.isCover === true) - Number(a.isCover === true)).flatMap(image => {
    const url = rows(image.variants).map(record).sort((a, b) => (num(b.width) ?? 0) - (num(a.width) ?? 0)).map(v => imageUrl(v.url)).find(Boolean);
    return url ? [url] : [];
  });
}
export function normalizeProduct(value: unknown, mode: Mode): Experience | null {
  const p = record(value), url = purchaseUrl(p.productUrl, mode);
  if (!str(p.productCode) || !str(p.title) || !url) return null;
  const pricing = record(p.pricing), base = num(record(pricing.summary).fromPrice), extra = record(pricing.extraChargesSummary), inclusive = num(extra.fromPrice);
  const currency = /^[A-Z]{3}$/.test(str(pricing.currency)) ? str(pricing.currency) : null;
  const reviews = record(p.reviews), rating = num(reviews.combinedAverageRating), duration = record(p.duration);
  const fixed = num(duration.fixedDurationInMinutes), from = num(duration.variableDurationFromMinutes), to = num(duration.variableDurationToMinutes);
  const minutes = (n: number) => n % 60 === 0 ? `${n / 60} h` : `${n} min`;
  const destinations = rows(p.destinations).map(record), destination = destinations.find(d => d.primary === true) ?? destinations[0];
  return {
    id: str(p.productCode), title: str(p.title), description: str(p.description), image: imagesFrom(p.images)[0] ?? null, url, destination: str(destination?.ref),
    currency, fromPrice: currency ? inclusive !== null ? Math.max(inclusive, base ?? 0) : base : null, extraCharges: num(extra.extraCharges),
    rating: rating !== null && rating <= 5 ? rating : null, reviews: num(reviews.totalReviews) ?? 0,
    sources: Array.from(new Set(rows(reviews.sources).map(s => str(record(s).provider)).filter(p => ["VIATOR", "TRIPADVISOR"].includes(p)))).map(p => p === "VIATOR" ? "Viator" : "Tripadvisor"),
    duration: fixed ? minutes(fixed) : from && to ? `${minutes(from)} – ${minutes(to)}` : null,
    freeCancellation: rows(p.flags).includes("FREE_CANCELLATION"),
  };
}
export function normalizeDetail(value: unknown, mode: Mode): Detail | null {
  const p = record(value), url = purchaseUrl(p.productUrl, mode);
  if (p.status !== "ACTIVE" || !str(p.productCode) || !str(p.title) || !url) return null;
  const descriptions = (value: unknown) => rows(value).map(record).map(item => str(item.otherDescription) || str(item.description) || str(item.typeDescription)).filter(Boolean);
  return { id: str(p.productCode), title: str(p.title), description: str(p.description), images: imagesFrom(p.images).slice(0, 8), url,
    inclusions: descriptions(p.inclusions), exclusions: descriptions(p.exclusions), additionalInfo: descriptions(p.additionalInfo),
    cancellation: str(record(p.cancellationPolicy).description), pricingType: str(record(p.pricingInfo).type), supplier: str(record(p.supplier).name) };
}
export function normalizeDestinations(value: unknown): Destination[] {
  const data = record(value);
  if (!Array.isArray(data.destinations)) throw new Error("Invalid destination response");
  const raw = data.destinations.map(record), names = new Map(raw.filter(r => r.type === "COUNTRY").map(r => [String(r.destinationId), str(r.name)]));
  return raw.filter(r => typeof r.destinationId === "number" && str(r.name)).map(r => {
    const path = str(r.lookupId).split(".");
    return { id: String(r.destinationId), name: str(r.name), type: str(r.type), parent: String(r.parentDestinationId ?? ""), path, country: path.map(id => names.get(id)).find(Boolean) ?? "" };
  }).sort((a, b) => a.name.localeCompare(b.name, "es"));
}
export const priceLabel = (amount: number, currency: string) => `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(amount)} ${currency}`;
export function savedProduct(item: Experience): Experience {
  return { ...item, fromPrice: null, extraCharges: null, currency: null, rating: null, reviews: 0, sources: [], freeCancellation: false };
}
