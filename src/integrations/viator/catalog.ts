import { z } from "zod";

// IDs verified against Viator /destinations; keep the provider's destination taxonomy.
export const DESTINATIONS = [
  { id: "631", name: "Cancún" },
  { id: "5501", name: "Playa del Carmen" },
  { id: "23012", name: "Tulum" },
  { id: "632", name: "Cozumel" },
] as const;
export const PAGE_SIZE = 12;
const date = z.string().default("").refine(value => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Cancun" }).format(new Date());
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value >= today;
}, "Elige una fecha válida que no esté en el pasado.");

export const searchInput = z.object({
  destination: z.enum(["631", "5501", "23012", "632"]).default("631"),
  q: z.string().trim().max(100).default(""),
  date,
  sort: z.enum(["recommended", "price", "rating"]).default("recommended"),
  cancellation: z.enum(["all", "free"]).default("all"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});
export type SearchInput = z.infer<typeof searchInput>;
export type Experience = {
  id: string; title: string; description: string; image: string | null; url: string;
  fromPrice: number | null; currency: string | null; extraCharges: number | null;
  rating: number | null; reviewCount: number; reviewSources: string[];
  duration: string | null; freeCancellation: boolean;
};
export type SearchResult = {
  items: Experience[]; total: number; page: number; pages: number;
  mode: "production" | "sandbox"; query: SearchInput;
};

export function searchRequest(input: SearchInput) {
  const sorting = input.sort === "price" ? { sort: "PRICE", order: "ASCENDING" }
    : input.sort === "rating" ? input.q ? { sort: "REVIEW_AVG_RATING" } : { sort: "TRAVELER_RATING", order: "DESCENDING" }
      : { sort: "DEFAULT" };
  const flags = input.cancellation === "free" ? { flags: ["FREE_CANCELLATION"] } : {};
  const pagination = { start: (input.page - 1) * PAGE_SIZE + 1, count: PAGE_SIZE };
  if (input.q) return { path: "/search/freetext", body: {
    searchTerm: input.q, currency: "MXN", productSorting: sorting,
    productFiltering: { destination: input.destination, ...flags, ...(input.date ? { dateRange: { from: input.date, to: input.date } } : {}) },
    searchTypes: [{ searchType: "PRODUCTS", pagination }],
  } };
  return { path: "/products/search", body: {
    filtering: { destination: input.destination, ...flags, ...(input.date ? { startDate: input.date, endDate: input.date } : {}) },
    sorting, pagination, currency: "MXN",
  } };
}

export const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const text = (value: unknown) => typeof value === "string" ? value : "";
const number = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

function trustedUrl(value: unknown, hosts: string[]) {
  try { const url = new URL(text(value)); return url.protocol === "https:" && !url.username && !url.password && hosts.includes(url.hostname) ? url.href : null; }
  catch { return null; }
}

/** Public fields only; preserve affiliate attribution and include in-destination charges. */
export function normalizeExperience(value: unknown, mode: "production" | "sandbox"): Experience | null {
  const p = object(value);
  const url = trustedUrl(p.productUrl, mode === "production" ? ["www.viator.com", "viator.com"] : ["www.viator.com", "shop.live.rc.viator.com"]);
  if (!text(p.productCode) || !text(p.title) || !url) return null;
  const images = array(p.images).map(object);
  const cover = images.find(image => image.isCover === true) ?? images[0];
  const image = array(cover?.variants).map(object).filter(v => (number(v.width) ?? 0) <= 1200)
    .sort((a, b) => (number(b.width) ?? 0) - (number(a.width) ?? 0))
    .map(v => trustedUrl(v.url, ["media.tacdn.com", "hare-media-cdn.tripadvisor.com", "dynamic-media-cdn.tripadvisor.com"]))
    .find(Boolean) ?? null;
  const pricing = object(p.pricing), summary = object(pricing.summary), extra = object(pricing.extraChargesSummary);
  const base = number(summary.fromPrice), inclusive = number(extra.fromPrice);
  const currency = /^[A-Z]{3}$/.test(text(pricing.currency)) ? text(pricing.currency) : null;
  const reviews = object(p.reviews), rating = number(reviews.combinedAverageRating);
  const duration = object(p.duration), fixed = number(duration.fixedDurationInMinutes), from = number(duration.variableDurationFromMinutes), to = number(duration.variableDurationToMinutes);
  const minutes = (value: number) => value % 60 === 0 ? `${value / 60} h` : `${value} min`;
  return {
    id: text(p.productCode), title: text(p.title), description: text(p.description), image, url,
    fromPrice: currency ? inclusive !== null ? Math.max(inclusive, base ?? 0) : base : null, currency,
    extraCharges: number(extra.extraCharges),
    rating: rating !== null && rating <= 5 ? rating : null, reviewCount: number(reviews.totalReviews) ?? 0,
    reviewSources: Array.from(new Set(array(reviews.sources).map(source => text(object(source).provider)).filter(source => ["VIATOR", "TRIPADVISOR"].includes(source)))).map(source => source === "VIATOR" ? "Viator" : "Tripadvisor"),
    duration: fixed ? minutes(fixed) : from && to ? `${minutes(from)}–${minutes(to)}` : null,
    freeCancellation: array(p.flags).includes("FREE_CANCELLATION"),
  };
}
