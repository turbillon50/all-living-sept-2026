import { NextResponse } from "next/server";
import { parseSearch } from "@/lib/catalog";
import { search, CatalogError } from "@/lib/viator";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  let input;
  try { input = parseSearch(new URL(request.url).searchParams); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Revisa tu búsqueda." }, { status: 400, headers }); }
  try { return NextResponse.json(await search(input), { headers }); }
  catch (error) {
    const status = error instanceof CatalogError ? error.status : 502;
    return NextResponse.json({ error: error instanceof CatalogError ? error.message : "No pudimos consultar las experiencias." }, { status, headers: { ...headers, ...(status === 429 ? { "Retry-After": "60" } : {}) } });
  }
}
