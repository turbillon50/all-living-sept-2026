import { NextResponse } from "next/server";
import { catalogInput } from "@/integrations/reloadly/catalog";
import { getCatalog, reloadlyReady } from "@/integrations/reloadly/provider";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const input = catalogInput.safeParse(Object.fromEntries(query));
  if (!input.success) return NextResponse.json({ error: "Consulta inválida." }, { status: 400 });
  if (!reloadlyReady()) return NextResponse.json({ ready: false, error: "El catálogo aún no está disponible." }, { status: 503 });
  try {
    return NextResponse.json({ ready: true, ...(await getCatalog(input.data)) }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return NextResponse.json({ ready: false, error: "No pudimos consultar el catálogo. Intenta de nuevo." }, { status: 502 });
  }
}
