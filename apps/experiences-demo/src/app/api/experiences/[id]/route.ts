import { NextResponse } from "next/server";
import { detail, CatalogError } from "@/lib/viator";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { return NextResponse.json(await detail((await params).id), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return NextResponse.json({ error: error instanceof CatalogError ? error.message : "No pudimos abrir la experiencia." }, { status: error instanceof CatalogError ? error.status : 502, headers: { "Cache-Control": "no-store" } }); }
}
