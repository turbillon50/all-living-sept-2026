import { describe, expect, it } from "vitest";
import { normalizeTicketmasterEvent } from "../events";

describe("normalizeTicketmasterEvent", () => {
  it("keeps only public event data and the direct Ticketmaster URL", () => {
    const event = normalizeTicketmasterEvent({
      id: "event-1",
      name: "Concierto en Cancún",
      url: "https://www.ticketmaster.com.mx/event/event-1",
      dates: { start: { localDate: "2026-11-20", localTime: "21:00:00" } },
      images: [
        { url: "https://s1.ticketm.net/small.jpg", width: 320, ratio: "16_9" },
        { url: "https://s1.ticketm.net/large.jpg", width: 1024, ratio: "16_9" },
      ],
      priceRanges: [{ min: 850, max: 1800, currency: "MXN" }],
      classifications: [{ segment: { name: "Music" } }],
      _embedded: { venues: [{ name: "Arena Cancún", city: { name: "Cancún" } }] },
    });

    expect(event).toMatchObject({
      id: "event-1",
      title: "Concierto en Cancún",
      ticketUrl: "https://www.ticketmaster.com.mx/event/event-1",
      venue: "Arena Cancún",
      city: "Cancún",
      imageUrl: "https://s1.ticketm.net/large.jpg",
      price: { min: 850, max: 1800, currency: "MXN" },
    });
  });

  it("rejects incomplete records instead of inventing content", () => {
    expect(normalizeTicketmasterEvent({ id: "incomplete", name: "Sin URL" })).toBeNull();
  });
});
