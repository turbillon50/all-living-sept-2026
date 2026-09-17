import { NextResponse } from "next/server";
import { destinations, CatalogError } from "@/lib/viator";
export async function GET() {
  try { const items = await destinations(); return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } }); }
  catch (error) { return NextResponse.json({ error: error instanceof CatalogError ? error.message : "No pudimos cargar los destinos." }, { status: error instanceof CatalogError ? error.status : 502, headers: { "Cache-Control": "no-store" } }); }
}
