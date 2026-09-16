const DISCOVERY_API = "https://app.ticketmaster.com/discovery/v2/events.json";
const REQUEST_INTERVAL_MS = 275; // Below Discovery's 5 requests/second per key.
let queue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;
let blockedUntil = 0;

export type EventsPlace = "cancun" | "playa-del-carmen" | "tulum";
export type EventCategory = "all" | "Music" | "Sports" | "Arts & Theatre";
export type EventFilters = { q: string; city: EventsPlace | "all"; date: string; category: EventCategory };
export type TicketmasterEvent = {
  id: string; title: string; date: string; time: string | null; venue: string; city: string;
  imageUrl: string | null; ticketUrl: string;
  price: { min: number; max: number; currency: string } | null;
  segment: string | null;
  artist?: string | null; spotifyId?: string | null; coordinates?: [number, number] | null;
};
export type PlaceEvents = {
  place: EventsPlace; label: string; events: TicketmasterEvent[];
  isLive: boolean; error: string | null; checkedAt: string;
  totalAvailable: number; truncated: boolean;
};
export const EVENT_PLACES = {
  cancun: { label: "Cancún", geoPoint: "d5f0rsk", radiusKm: 35, cities: ["Cancún", "Cancun"] },
  "playa-del-carmen": { label: "Playa del Carmen", geoPoint: "d5dj6ed", radiusKm: 30, cities: ["Playa del Carmen", "Solidaridad"] },
  tulum: { label: "Tulum", geoPoint: "d59fcxm", radiusKm: 30, cities: ["Tulum"] },
} as const;
const categories: EventCategory[] = ["all", "Music", "Sports", "Arts & Theatre"];
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function parseFilters(raw: Record<string, string | string[] | undefined>): EventFilters {
  const text = (key: string) => typeof raw[key] === "string" ? raw[key] as string : "";
  const city = text("city"); const category = text("category"); const date = text("date");
  return {
    q: text("q").trim().slice(0, 80),
    city: Object.hasOwn(EVENT_PLACES, city) ? city as EventsPlace : "all",
    category: categories.includes(category as EventCategory) ? category as EventCategory : "all",
    date: validDate(date) ? date : "",
  };
}
type RawEvent = {
  id?: string; name?: string; url?: string;
  images?: Array<{ url?: string; width?: number; ratio?: string }>;
  dates?: { start?: { localDate?: string; localTime?: string }; status?: { code?: string } };
  priceRanges?: Array<{ min?: number; max?: number; currency?: string }>;
  classifications?: Array<{ segment?: { name?: string } }>;
  _embedded?: { venues?: Array<{ name?: string; city?: { name?: string }; country?: { countryCode?: string }; state?: { name?: string; stateCode?: string }; location?: { latitude?: string; longitude?: string } }>; attractions?: Array<{ name?: string; externalLinks?: { spotify?: Array<{ url?: string }> } }> };
};
type DiscoveryResponse = { page: { totalElements: number }; _embedded?: { events?: RawEvent[] } };
function safeUrl(value: string | undefined, images = false): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const allowed = images ? ["s1.ticketm.net", "s1.ticketmaster.com"] : ["ticketmaster.com.mx", "ticketmaster.com"];
    return url.protocol === "https:" && !url.username && !url.password && allowed.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`)) ? url.href : null;
  } catch { return null; }
}
export function normalizeTicketmasterEvent(raw: RawEvent): TicketmasterEvent | null {
  const venue = raw._embedded?.venues?.[0];
  const ticketUrl = safeUrl(raw.url);
  const date = raw.dates?.start?.localDate;
  if (!raw.id || !raw.name || !ticketUrl || !date || !validDate(date)) return null;
  if (venue?.country?.countryCode && venue.country.countryCode !== "MX") return null;
  const images = (raw.images ?? []).filter(image => safeUrl(image.url, true));
  const landscape = images.filter(image => image.ratio === "16_9");
  const image = (landscape.length ? landscape : images).sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
  const range = raw.priceRanges?.find(price => Number.isFinite(price.min) && (price.min ?? -1) >= 0 && /^[A-Z]{3}$/.test(price.currency ?? ""));
  const attraction = raw._embedded?.attractions?.[0];
  const spotifyUrl = attraction?.externalLinks?.spotify?.[0]?.url;
  const spotifyId = spotifyUrl?.match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?artist\/([a-zA-Z0-9]{22})(?:\?.*)?$/)?.[1] ?? null;
  const lat = venue?.location?.latitude ? Number(venue.location.latitude) : NaN;
  const lng = venue?.location?.longitude ? Number(venue.location.longitude) : NaN;
  return {
    id: raw.id, title: raw.name, ticketUrl, date,
    time: /^\d{2}:\d{2}(:\d{2})?$/.test(raw.dates?.start?.localTime ?? "") ? raw.dates!.start!.localTime! : null,
    venue: venue?.name ?? "Recinto por confirmar", city: venue?.city?.name ?? "Quintana Roo",
    imageUrl: safeUrl(image?.url, true), segment: raw.classifications?.[0]?.segment?.name ?? null,
    artist: attraction?.name ?? null, spotifyId,
    coordinates: Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null,
    price: range ? { min: range.min!, max: Number.isFinite(range.max) && range.max! >= range.min! ? range.max! : range.min!, currency: range.currency! } : null,
  };
}

export function discoveryParams(place: EventsPlace, filters: EventFilters, byCity = false, now = new Date()) {
  const config = EVENT_PLACES[place];
  const params = new URLSearchParams({ countryCode: "MX", source: "ticketmaster", size: "200", sort: "date,asc" });
  if (byCity) {
    params.set("city", config.cities.join(","));
  } else {
    params.set("geoPoint", config.geoPoint); params.set("radius", String(config.radiusKm)); params.set("unit", "km");
  }
  if (filters.q) params.set("keyword", filters.q);
  if (filters.category !== "all") params.set("classificationName", filters.category);
  const requested = filters.date ? new Date(`${filters.date}T00:00:00-05:00`) : now;
  params.set("startDateTime", new Date(Math.max(requested.getTime(), now.getTime())).toISOString().replace(/\.\d{3}Z$/, "Z"));
  return params;
}

async function requestEvents(params: URLSearchParams, isSearch: boolean): Promise<DiscoveryResponse> {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) throw new Error("NOT_CONFIGURED");
  const url = new URL(DISCOVERY_API);
  url.search = params.toString(); url.searchParams.set("apikey", key);
  const scheduled = queue.then(async () => {
    if (Date.now() < blockedUntil) throw new Error("RATE_LIMITED");
    const delay = Math.max(0, REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    lastRequestAt = Date.now();
    const response = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: isSearch ? 60 : 900 }, signal: AbortSignal.timeout(8_000) });
    if (response.status === 429) {
      const retry = Number(response.headers.get("retry-after"));
      const reset = Number(response.headers.get("rate-limit-reset"));
      blockedUntil = Math.max(Date.now() + (Number.isFinite(retry) && retry > 0 ? retry * 1000 : 60_000), Number.isFinite(reset) && reset > Date.now() ? reset : 0);
      throw new Error("RATE_LIMITED");
    }
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const data = await response.json() as DiscoveryResponse;
    if (!data.page || !Number.isFinite(data.page.totalElements) || data.page.totalElements < 0 || (data.page.totalElements > 0 && !Array.isArray(data._embedded?.events))) throw new Error("INVALID_RESPONSE");
    return data;
  });
  queue = scheduled.then(() => undefined, () => undefined);
  return scheduled;
}
async function findEvents(place: EventsPlace, filters: EventFilters, now: Date): Promise<PlaceEvents> {
  const result: PlaceEvents = { place, label: EVENT_PLACES[place].label, events: [], isLive: false, error: null, checkedAt: now.toISOString(), totalAvailable: 0, truncated: false };
  try {
    const isSearch = Boolean(filters.q || filters.date || filters.category !== "all");
    let data = await requestEvents(discoveryParams(place, filters, false, now), isSearch);
    if (data.page.totalElements === 0) data = await requestEvents(discoveryParams(place, filters, true, now), isSearch);
    const raw = data._embedded?.events ?? [];
    const events = raw.map(normalizeTicketmasterEvent).filter((event): event is TicketmasterEvent => event !== null);
    // A nonempty payload we cannot render is an error, never an invented empty plaza.
    if (raw.length > 0 && events.length === 0) throw new Error("INVALID_EVENTS");
    return { ...result, events: [...new Map(events.map(event => [event.id, event])).values()], isLive: true, totalAvailable: data.page.totalElements, truncated: data.page.totalElements > raw.length };
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return { ...result, error: code === "RATE_LIMITED" ? "Ticketmaster alcanzó temporalmente su límite de consultas. Intenta de nuevo más tarde." : code === "NOT_CONFIGURED" ? "La conexión con Ticketmaster no está disponible. Intenta de nuevo más tarde." : "No pudimos consultar Ticketmaster. Vuelve a intentarlo en un momento." };
  }
}
export async function getQuintanaRooEvents(filters: EventFilters = parseFilters({})) {
  const places = filters.city === "all" ? Object.keys(EVENT_PLACES) as EventsPlace[] : [filters.city];
  const results: PlaceEvents[] = [];
  // Bucket the start time so the fetch-cache URL is stable, including an empty catalog.
  const interval = filters.q || filters.date || filters.category !== "all" ? 60_000 : 900_000;
  const now = new Date(Math.floor(Date.now() / interval) * interval);
  for (const place of places) results.push(await findEvents(place, filters, now));
  return results;
}
