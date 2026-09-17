import { NextResponse } from "next/server";
import { searchInput } from "@/integrations/viator/catalog";
import { searchExperiences, ViatorUnavailable } from "@/integrations/viator/provider";

export async function GET(request: Request) {
  const parsed = searchInput.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Revisa tu búsqueda." }, { status: 400, headers });
  try { return NextResponse.json(await searchExperiences(parsed.data), { headers }); }
  catch (error) {
    const status = error instanceof ViatorUnavailable ? error.status : 502;
    return NextResponse.json({ error: status === 429 ? "Hay muchas búsquedas en este momento. Intenta de nuevo en un minuto." : "No pudimos consultar Viator. Vuelve a intentarlo en un momento." }, { status, headers: { ...headers, ...(status === 429 ? { "Retry-After": "60" } : {}) } });
  }
}
