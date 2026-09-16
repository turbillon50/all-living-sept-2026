import type { FlightOffer, FlightSlice } from "./types";

export function durationMinutes(value: string): number {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(value);
  if (!match || !match.slice(1).some(Boolean)) return Infinity;
  return Number(match[1] || 0) * 1440 + Number(match[2] || 0) * 60 + Number(match[3] || 0) + Number(match[4] || 0) / 60;
}
export function durationLabel(value: string | number): string {
  const minutes = typeof value === "number" ? value : durationMinutes(value);
  if (!Number.isFinite(minutes)) return "Duración por confirmar";
  const rounded = Math.round(minutes), hours = Math.floor(rounded / 60), rest = rounded % 60;
  return [hours ? `${hours} h` : "", rest ? `${rest} min` : ""].filter(Boolean).join(" ") || "0 min";
}
export const totalDuration = (offer: FlightOffer) => offer.slices.reduce((sum, slice) => sum + durationMinutes(slice.duration), 0);
export const stopCount = (slice: FlightSlice) => Math.max(0, slice.segments.length - 1) + slice.segments.reduce((sum, segment) => sum + (segment.stops?.length ?? 0), 0);
export const airlineNames = (offer: FlightOffer) => [...new Set(offer.slices.flatMap(slice => slice.segments.map(segment => segment.marketing_carrier.name)))];

/** Duffel timestamps are airport-local wall times; never convert them to the viewer's zone. */
export const localTime = (value: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) ? value.slice(11, 16) : "—";
export function localDateLabel(value: string): string {
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return "";
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
}
export const priceLabel = (amount: string | number, currency: string) => new Intl.NumberFormat("es-MX", { style: "currency", currency, currencyDisplay: "code", maximumFractionDigits: 2 }).format(Number(amount));

export type OfferFilters = { currency: string; stops: "any" | "0" | "1"; airline: string; sort: "price" | "duration" | "departure"; now: number };
export function selectOffers(offers: FlightOffer[], filter: OfferFilters): FlightOffer[] {
  const filtered = offers.filter(offer => offer.total_currency === filter.currency && Date.parse(offer.expires_at) > filter.now &&
    (filter.stops === "any" || offer.slices.every(slice => stopCount(slice) <= Number(filter.stops))) &&
    (!filter.airline || airlineNames(offer).includes(filter.airline)));
  return filtered.sort((a, b) => {
    if (filter.sort === "duration") return totalDuration(a) - totalDuration(b) || Number(a.total_amount) - Number(b.total_amount);
    if (filter.sort === "departure") return (a.slices[0]?.segments[0]?.departing_at ?? "").localeCompare(b.slices[0]?.segments[0]?.departing_at ?? "") || Number(a.total_amount) - Number(b.total_amount);
    return Number(a.total_amount) - Number(b.total_amount) || totalDuration(a) - totalDuration(b);
  });
}

/** Keep the search payload small and limited to fields shown in the public experience. */
export function publicOffer(offer: FlightOffer): FlightOffer {
  const airport = (value: FlightSlice["origin"]) => ({ iata_code: value.iata_code, name: value.name, city_name: value.city_name });
  const carrier = (value: FlightOffer["owner"]) => ({ name: value.name, iata_code: value.iata_code, logo_symbol_url: airlineLogo(value.logo_symbol_url), logo_lockup_url: airlineLogo(value.logo_lockup_url) });
  return {
    id: offer.id, total_amount: offer.total_amount, total_currency: offer.total_currency, expires_at: offer.expires_at, owner: carrier(offer.owner),
    slices: offer.slices.map(slice => ({
      duration: slice.duration, origin: airport(slice.origin), destination: airport(slice.destination), fare_brand_name: slice.fare_brand_name,
      segments: slice.segments.map(segment => ({
        id: segment.id, departing_at: segment.departing_at, arriving_at: segment.arriving_at, duration: segment.duration,
        origin: airport(segment.origin), destination: airport(segment.destination), origin_terminal: segment.origin_terminal, destination_terminal: segment.destination_terminal,
        marketing_carrier: carrier(segment.marketing_carrier), operating_carrier: carrier(segment.operating_carrier), marketing_carrier_flight_number: segment.marketing_carrier_flight_number,
        stops: segment.stops?.map(stop => ({ airport: airport(stop.airport), duration: stop.duration })),
        passengers: segment.passengers?.map(passenger => ({ cabin_class: passenger.cabin_class, cabin_class_marketing_name: passenger.cabin_class_marketing_name, baggages: passenger.baggages?.map(bag => ({ type: bag.type, quantity: bag.quantity })) })),
      })),
    })),
  };
}

export function airlineLogo(value?: string | null): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "assets.duffel.com" && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
