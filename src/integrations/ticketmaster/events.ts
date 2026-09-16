const DISCOVERY_API = "https://app.ticketmaster.com/discovery/v2/events.json";
const DISCOVERY_REQUEST_INTERVAL_MS = 250;

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

export type EventsPlace = "cancun" | "playa-del-carmen" | "tulum";

export type TicketmasterEvent = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  venue: string;
  city: string;
  imageUrl: string | null;
  ticketUrl: string;
  price: {
    min: number;
    max: number;
    currency: string;
  } | null;
  segment: string | null;
};

export type PlaceEvents = {
  place: EventsPlace;
  label: string;
  events: TicketmasterEvent[];
  isLive: boolean;
  error: string | null;
};

type TicketmasterImage = {
  url?: string;
  width?: number;
  height?: number;
  ratio?: string;
};

type TicketmasterRawEvent = {
  id?: string;
  name?: string;
  url?: string;
  images?: TicketmasterImage[];
  dates?: { start?: { localDate?: string; localTime?: string } };
  priceRanges?: Array<{ min?: number; max?: number; currency?: string }>;
  classifications?: Array<{ segment?: { name?: string } }>;
  _embedded?: {
    venues?: Array<{ name?: string; city?: { name?: string } }>;
  };
};

type TicketmasterResponse = {
  _embedded?: { events?: TicketmasterRawEvent[] };
};

type PlaceConfig = {
  label: string;
  geoPoint: string;
  radiusKm: number;
  cityFallbacks: string[];
};

// GeoHashes centrados en las tres plazas. Los radios evitan depender de cómo
// Ticketmaster escriba municipio/ciudad en cada venue.
export const EVENT_PLACES: Record<EventsPlace, PlaceConfig> = {
  cancun: {
    label: "Cancún",
    geoPoint: "d5f0rsk",
    radiusKm: 50,
    cityFallbacks: ["Cancún", "Cancun"],
  },
  "playa-del-carmen": {
    label: "Playa del Carmen",
    geoPoint: "d5dj6ed",
    radiusKm: 40,
    cityFallbacks: ["Playa del Carmen", "Solidaridad"],
  },
  tulum: {
    label: "Tulum",
    geoPoint: "d59fcxm",
    radiusKm: 45,
    cityFallbacks: ["Tulum"],
  },
};

function chooseImage(images: TicketmasterImage[] | undefined) {
  if (!images?.length) return null;

  const landscape = images.filter((image) => image.url && image.ratio === "16_9");
  const candidates = landscape.length ? landscape : images.filter((image) => image.url);

  return [...candidates]
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
    ?.url ?? null;
}

export function normalizeTicketmasterEvent(raw: TicketmasterRawEvent): TicketmasterEvent | null {
  const venue = raw._embedded?.venues?.[0];
  const price = raw.priceRanges?.find(
    (range) => Number.isFinite(range.min) && Number.isFinite(range.max) && range.currency,
  );

  if (!raw.id || !raw.name || !raw.url || !raw.dates?.start?.localDate) return null;

  return {
    id: raw.id,
    title: raw.name,
    date: raw.dates.start.localDate,
    time: raw.dates.start.localTime ?? null,
    venue: venue?.name ?? "Venue por confirmar",
    city: venue?.city?.name ?? "Quintana Roo",
    imageUrl: chooseImage(raw.images),
    ticketUrl: raw.url,
    price: price
      ? {
          min: price.min as number,
          max: price.max as number,
          currency: price.currency as string,
        }
      : null,
    segment: raw.classifications?.[0]?.segment?.name ?? null,
  };
}

async function requestEvents(params: URLSearchParams) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) throw new Error("TICKETMASTER_NOT_CONFIGURED");

  const url = new URL(DISCOVERY_API);
  params.set("apikey", apiKey);
  params.set("countryCode", "MX");
  params.set("size", "60");
  params.set("sort", "date,asc");
  params.set("source", "ticketmaster");
  for (const [key, value] of params) url.searchParams.set(key, value);

  const scheduled = requestQueue.then(async () => {
    const waitFor = Math.max(0, DISCOVERY_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (waitFor) await new Promise((resolve) => setTimeout(resolve, waitFor));
    lastRequestAt = Date.now();

    return fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(9_000),
    });
  });

  requestQueue = scheduled.then(() => undefined, () => undefined);
  const response = await scheduled;

  if (!response.ok) throw new Error(`TICKETMASTER_HTTP_${response.status}`);
  return (await response.json()) as TicketmasterResponse;
}

function normalizedEvents(response: TicketmasterResponse) {
  return (response._embedded?.events ?? [])
    .map(normalizeTicketmasterEvent)
    .filter((event): event is TicketmasterEvent => event !== null);
}

async function findEventsForPlace(place: EventsPlace, keyword?: string): Promise<PlaceEvents> {
  const config = EVENT_PLACES[place];

  try {
    const geoParams = new URLSearchParams({
      geoPoint: config.geoPoint,
      radius: String(config.radiusKm),
      unit: "km",
    });
    if (keyword) geoParams.set("keyword", keyword);

    let events = normalizedEvents(await requestEvents(geoParams));

    // Algunos venues mexicanos no publican coordenadas. Sólo cuando el radio no
    // arroja inventario probamos las variantes reales de ciudad/municipio.
    for (const city of config.cityFallbacks) {
      if (events.length) break;
      const cityParams = new URLSearchParams({ city });
      if (keyword) cityParams.set("keyword", keyword);
      events = normalizedEvents(await requestEvents(cityParams));
    }

    const unique = [...new Map(events.map((event) => [event.id, event])).values()];

    return {
      place,
      label: config.label,
      events: unique,
      isLive: true,
      error: null,
    };
  } catch (error) {
    return {
      place,
      label: config.label,
      events: [],
      isLive: false,
      error: error instanceof Error && error.message === "TICKETMASTER_NOT_CONFIGURED"
        ? "La conexión con Ticketmaster todavía no está configurada."
        : "No pudimos consultar Ticketmaster en este momento. Intenta de nuevo más tarde.",
    };
  }
}

export async function getQuintanaRooEvents(keyword?: string) {
  const places = Object.keys(EVENT_PLACES) as EventsPlace[];
  const results: PlaceEvents[] = [];

  // Secuencial a propósito: la Discovery API limita ráfagas por llave.
  for (const place of places) {
    results.push(await findEventsForPlace(place, keyword?.trim() || undefined));
  }

  return results;
}
