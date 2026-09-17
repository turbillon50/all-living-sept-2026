import { describe, expect, it } from "vitest";
import { normalizeDestinations, normalizeDetail, normalizeProduct, parseSearch, requestFor, savedProduct } from "./catalog";
const product = {
  productCode: "110186P2", title: "Chichén Itzá", productUrl: "https://www.viator.com/es-ES/tours/Cancun/d631-110186P2?pid=P00303684&campaign=all-living-catalog",
  pricing: { summary: { fromPrice: 861.9 }, currency: "MXN", extraChargesSummary: { fromPrice: 1727.7, extraCharges: 865.8 }, wholesale: 100 },
  images: [{ isCover: true, variants: [{ width: 720, url: "https://hare-media-cdn.tripadvisor.com/photo.jpg" }] }],
  reviews: { combinedAverageRating: 4.7, totalReviews: 25, sources: [{ provider: "VIATOR" }] }, flags: ["FREE_CANCELLATION"], secret: "not-public",
};
describe("public Viator catalog", () => {
  it("includes destination charges and preserves affiliate attribution without supplier/private data", () => {
    const result = normalizeProduct(product, "production");
    expect(result).toMatchObject({ fromPrice: 1727.7, extraCharges: 865.8, currency: "MXN", url: product.productUrl, rating: 4.7, reviews: 25 });
    expect(result).not.toHaveProperty("secret"); expect(result).not.toHaveProperty("pricing");
  });
  it("cannot redirect the live catalog to sandbox, executable URLs or lookalike domains", () => {
    for (const url of ["https://shop.live.rc.viator.com/test", "javascript:alert(1)", "https://viator.com.evil.example/book", "https://www.viator.com@evil.example/"]) expect(normalizeProduct({ ...product, productUrl: url }, "production")).toBeNull();
  });
  it("does not turn incomplete prices or absent ratings into fabricated offers", () => {
    expect(normalizeProduct({ ...product, pricing: { currency: "MXN" }, reviews: {} }, "production")).toMatchObject({ fromPrice: null, rating: null, reviews: 0 });
    expect(normalizeProduct({ ...product, pricing: { summary: { fromPrice: NaN }, currency: "oops" } }, "production")?.fromPrice).toBeNull();
  });
  it("rejects invalid dates, destinations and pagination before any provider call", () => {
    for (const input of ["date=2030-02-30", "date=2000-01-01", "destination=../../keys", "page=0", "page=1.2", "currency=BTC", "maxPrice=-1"]) expect(() => parseSearch(new URLSearchParams(input))).toThrow();
  });
  it("sends text, date, currency, country, cancellation and page to the live search, with provider-specific rating order", () => {
    const request = requestFor(parseSearch(new URLSearchParams("destination=67&q=museo&date=2030-05-10&currency=EUR&cancellation=true&page=2&sort=rating&maxPrice=100")));
    expect(request).toMatchObject({ path: "/search/freetext", body: { searchTerm: "museo", currency: "EUR", productSorting: { sort: "REVIEW_AVG_RATING" }, productFiltering: { destination: "67", dateRange: { from: "2030-05-10", to: "2030-05-10" }, flags: ["FREE_CANCELLATION"], price: { to: 100 } }, searchTypes: [{ searchType: "PRODUCTS", pagination: { start: 19, count: 18 } }] } });
  });
  it("keeps the Caribbean hierarchy and international destinations from Viator", () => {
    const rows = normalizeDestinations({ destinations: [{ destinationId: 32, name: "República Dominicana", type: "COUNTRY", parentDestinationId: 4, lookupId: "4.32" }, { destinationId: 794, name: "Punta Cana", type: "CITY", parentDestinationId: 32, lookupId: "4.32.794" }] });
    expect(rows.find(d => d.id === "794")).toMatchObject({ country: "República Dominicana", path: ["4", "32", "794"] });
  });
  it("saved plans do not carry stale prices, ratings or cancellation promises", () => {
    expect(savedProduct(normalizeProduct(product, "production")!)).toMatchObject({ fromPrice: null, rating: null, reviews: 0, freeCancellation: false, extraCharges: null });
  });
  it("keeps product-specific conditions and rejects inactive details", () => {
    const detail = normalizeDetail({ ...product, status: "ACTIVE", inclusions: [{ otherDescription: "Transporte incluido" }], cancellationPolicy: { description: "Cancela hasta 24 horas antes." } }, "production");
    expect(detail).toMatchObject({ inclusions: ["Transporte incluido"], cancellation: "Cancela hasta 24 horas antes." });
    expect(normalizeDetail({ ...product, status: "INACTIVE" }, "production")).toBeNull();
  });
});
