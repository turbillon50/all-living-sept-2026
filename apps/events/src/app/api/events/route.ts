import { getQuintanaRooEvents, parseFilters } from "@/lib/ticketmaster";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const filters = parseFilters(Object.fromEntries(new URL(request.url).searchParams));
  const places = await getQuintanaRooEvents(filters);
  const ok = places.every(place => place.isLive);
  return Response.json({ ok, source: "Ticketmaster Discovery API", filters, places }, {
    status: ok ? 200 : 503,
    headers: { "Cache-Control": ok ? "public, s-maxage=60, max-age=0" : "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
