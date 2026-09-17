import { afterEach, describe, expect, it, vi } from "vitest";
import type { FlightOffer, FlightSlice } from "../types";
import { durationMinutes, localDateLabel, localTime, matchesAirports, matchesDepartureDates, publicOffer, selectOffers, stopCount, totalDuration } from "../offer-utils";
import { flightSearchSchema } from "../search-schema";

const segment = { id: "segment", departing_at: "2030-10-20T23:10:00", arriving_at: "2030-10-21T02:20:00", duration: "PT2H10M", origin: { iata_code: "MEX" }, destination: { iata_code: "CUN" }, marketing_carrier: { name: "Carrier", iata_code: "XX" }, operating_carrier: { name: "Carrier", iata_code: "XX" } };
const slice: FlightSlice = { duration: "PT2H10M", origin: segment.origin, destination: segment.destination, segments: [segment] };
const offer: FlightOffer = { id: "base", total_amount: "200", total_currency: "USD", expires_at: "2030-10-20T20:30:00Z", owner: segment.marketing_carrier, slices: [slice] };
const filter = { currency: "USD", stops: "any" as const, airline: "", sort: "price" as const, now: Date.parse("2030-10-20T20:00:00Z") };
afterEach(() => vi.useRealTimers());

describe("flight search correctness", () => {
  it("rejects a different departure day instead of relabeling it as the requested day", () => {
    expect(matchesDepartureDates(offer, { depart: "2030-10-20" })).toBe(true);
    expect(matchesDepartureDates(offer, { depart: "2030-10-26" })).toBe(false);
    expect(matchesDepartureDates(offer, { depart: "2030-10-27" })).toBe(false);
    expect(localDateLabel("2030-10-20T00:05:00+14:00")).toMatch(/^20\b/);
  });
  it("checks both departure dates while allowing overnight arrivals and connections", () => {
    const outbound = { ...slice, segments: [segment, { ...segment, id: "next-day", departing_at: "2030-10-21T03:00:00" }] };
    const returnLeg = { ...slice, segments: [{ ...segment, departing_at: "2030-10-27T23:55:00-06:00", arriving_at: "2030-10-28T02:00:00" }] };
    const roundTrip = { ...offer, slices: [outbound, returnLeg] };
    expect(matchesDepartureDates(roundTrip, { depart: "2030-10-20", returnDate: "2030-10-27" })).toBe(true);
    expect(matchesDepartureDates(roundTrip, { depart: "2030-10-20", returnDate: "2030-10-26" })).toBe(false);
    expect(matchesDepartureDates(roundTrip, { depart: "2030-10-20" })).toBe(false);
    expect(matchesDepartureDates(offer, { depart: "2030-10-20", returnDate: "2030-10-27" })).toBe(false);
  });
  it("rejects missing or malformed departure timestamps", () => {
    expect(matchesDepartureDates({ ...offer, slices: [{ ...slice, segments: [] }] }, { depart: "2030-10-20" })).toBe(false);
    expect(matchesDepartureDates({ ...offer, slices: [{ ...slice, segments: [{ ...segment, departing_at: "2030-10-20" }] }] }, { depart: "2030-10-20" })).toBe(false);
  });
  it("never compares different currencies or expired offers as cheaper choices", () => {
    const result = selectOffers([offer, { ...offer, id: "mxn", total_currency: "MXN", total_amount: "10" }, { ...offer, id: "expired", total_amount: "1", expires_at: "2030-10-20T19:59:00Z" }, { ...offer, id: "cheap", total_amount: "150" }], filter);
    expect(result.map(item => item.id)).toEqual(["cheap", "base"]);
  });
  it("applies the nonstop filter to the return flight as well as the outbound", () => {
    const roundTrip = { ...offer, slices: [slice, { ...slice, segments: [segment, { ...segment, id: "connection" }] }] };
    expect(selectOffers([roundTrip], { ...filter, stops: "0" })).toEqual([]);
    expect(selectOffers([roundTrip], { ...filter, stops: "1" })).toHaveLength(1);
  });
  it("counts a technical stop even when the airline keeps one flight segment", () => {
    expect(stopCount({ ...slice, segments: [{ ...segment, stops: [{ airport: { iata_code: "MTY" }, duration: "PT30M" }] }] })).toBe(1);
  });
  it("respects a selected airport on the return instead of silently substituting a nearby airport", () => {
    const otherAirport = { ...offer, slices: [slice, { ...slice, segments: [{ ...segment, origin: { iata_code: "CUN" }, destination: { iata_code: "NLU" } }] }] };
    expect(matchesAirports(otherAirport, { origin: "MEX", destination: "CUN", originType: "airport" })).toBe(false);
    expect(matchesAirports(otherAirport, { origin: "MEX", destination: "CUN", originType: "city" })).toBe(true);
  });
  it("uses complete trip durations and keeps airport local times across midnight", () => {
    expect(durationMinutes("P1DT2H30M")).toBe(1590);
    expect(durationMinutes("invalid")).toBe(Infinity);
    expect(totalDuration({ ...offer, slices: [slice, { ...slice, duration: "PT3H" }] })).toBe(310);
    expect(localTime(segment.departing_at)).toBe("23:10");
    expect(localTime(segment.arriving_at)).toBe("02:20");
  });
  it("rejects impossible dates, past dates, reversed returns and identical airports", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2030-01-01T12:00:00Z"));
    const input = { origin: "MEX", destination: "CUN", depart: "2030-10-20", returnDate: "2030-10-27", adults: 2 };
    expect(flightSearchSchema.safeParse(input).success).toBe(true);
    for (const update of [{ depart: "2030-02-30" }, { depart: "2029-12-30" }, { returnDate: "2030-10-19" }, { destination: "MEX" }, { adults: 0 }]) expect(flightSearchSchema.safeParse({ ...input, ...update }).success).toBe(false);
  });
  it("projects logos and baggage without copying passenger or unrelated provider data", () => {
    const raw = { ...offer, passenger_identity_documents_required: true, slices: [{ ...slice, segments: [{ ...segment, marketing_carrier: { ...segment.marketing_carrier, logo_symbol_url: "https://assets.duffel.com/img/logo.svg" }, passengers: [{ given_name: "Private", cabin_class: "economy", baggages: [{ type: "checked", quantity: 1 }] }] }] }] };
    const projected = publicOffer(raw);
    expect(JSON.stringify(projected)).not.toContain("Private");
    expect(projected).not.toHaveProperty("passenger_identity_documents_required");
    expect(projected.slices[0]?.segments[0]?.passengers?.[0]?.baggages).toEqual([{ type: "checked", quantity: 1 }]);
    expect(projected.slices[0]?.segments[0]?.marketing_carrier.logo_symbol_url).toBe("https://assets.duffel.com/img/logo.svg");
  });
});
