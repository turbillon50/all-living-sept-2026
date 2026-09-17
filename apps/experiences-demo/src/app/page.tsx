import { CatalogApp } from "@/ui/catalog-app";
import { DEFAULT_SEARCH, parseSearch } from "@/lib/catalog";
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams, values = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) if (typeof value === "string") values.set(key, value);
  let initial = DEFAULT_SEARCH;
  try { initial = parseSearch(values); } catch { /* The API still validates all subsequent searches. */ }
  return <CatalogApp view="explore" initial={initial} />;
}
