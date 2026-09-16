import "server-only";
import { env } from "@/core/env";
import { countryName, normalizeItem, type CatalogInput, type CatalogItem } from "./catalog";

type Product = CatalogInput["kind"];
type Token = { value: string; expiresAt: number };
const tokens = new Map<string, Token>();
const pending = new Map<string, Promise<Token>>();
const PAGE_SIZE = 24;
const headers = { topups: "application/com.reloadly.topups-v1+json", giftcards: "application/com.reloadly.giftcards-v1+json" };

export class ReloadlyUnavailable extends Error {
  constructor(public readonly status: number) { super("No pudimos consultar el catálogo en este momento."); }
}

export function reloadlyReady() { return Boolean(env().RELOADLY_CLIENT_ID && env().RELOADLY_CLIENT_SECRET); }

function audience(product: Product) {
  return `https://${product}${env().RELOADLY_ENV === "sandbox" ? "-sandbox" : ""}.reloadly.com`;
}

async function accessToken(product: Product): Promise<string> {
  if (!reloadlyReady()) throw new ReloadlyUnavailable(503);
  const key = audience(product);
  const current = tokens.get(key);
  if (current && current.expiresAt > Date.now()) return current.value;
  let operation = pending.get(key);
  if (!operation) {
    operation = (async () => {
      const response = await fetch("https://auth.reloadly.com/oauth/token", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ client_id: env().RELOADLY_CLIENT_ID, client_secret: env().RELOADLY_CLIENT_SECRET, grant_type: "client_credentials", audience: key }),
      });
      if (!response.ok) throw new ReloadlyUnavailable(response.status);
      const data = await response.json() as { access_token?: unknown; expires_in?: unknown };
      if (typeof data.access_token !== "string" || typeof data.expires_in !== "number" || data.expires_in <= 0) throw new ReloadlyUnavailable(502);
      const token = { value: data.access_token, expiresAt: Date.now() + Math.max(1, data.expires_in - Math.min(300, data.expires_in / 2)) * 1000 };
      tokens.set(key, token);
      return token;
    })();
    pending.set(key, operation);
  }
  try { return (await operation).value; }
  finally { if (pending.get(key) === operation) pending.delete(key); }
}

/** Deliberately GET-only. Catalog activation cannot spend a wallet balance. */
async function read(product: Product, path: string): Promise<unknown> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await accessToken(product);
    const response = await fetch(audience(product) + path, {
      headers: { Accept: headers[product], Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000), next: { revalidate: 300 },
    });
    if (response.status === 401 && attempt === 0) { tokens.delete(audience(product)); continue; }
    if (!response.ok) throw new ReloadlyUnavailable(response.status);
    return response.json();
  }
  throw new ReloadlyUnavailable(502);
}

const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const rows = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(object(value).content) ? object(value).content as unknown[] : [];

export async function getCountries(): Promise<Array<{ code: string; name: string }>> {
  return rows(await read("topups", "/countries")).map(value => object(value).isoName)
    .filter((code): code is string => typeof code === "string" && /^[A-Z]{2}$/.test(code))
    .map(code => ({ code, name: countryName(code) })).sort((a,b) => a.name.localeCompare(b.name, "es"));
}

export async function getCatalog(input: CatalogInput): Promise<{ items: CatalogItem[]; page: number; pages: number; total: number; mode: "live" | "sandbox" }> {
  const { kind, country, page } = input;
  const path = kind === "topups" ? `/operators/countries/${country}?includeBundles=true&includePin=true` : `/products?countryCode=${country}&page=${page}&size=${PAGE_SIZE}`;
  const result = await read(kind, path);
  const items = rows(result).map(value => normalizeItem(value,kind)).filter((x): x is CatalogItem => x !== null);
  const data = object(result);
  const total = kind === "topups" ? items.length : typeof data.totalElements === "number" ? data.totalElements : items.length;
  const pages = kind === "topups" ? Math.max(1,Math.ceil(items.length / PAGE_SIZE)) : typeof data.totalPages === "number" ? Math.max(1,data.totalPages) : 1;
  return { items: kind === "topups" ? items.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE) : items, page, pages, total, mode: env().RELOADLY_ENV };
}
