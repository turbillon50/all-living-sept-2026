import { z } from "zod";

export const catalogInput = z.object({
  kind: z.enum(["topups", "giftcards"]).default("topups"),
  country: z.string().regex(/^[A-Z]{2}$/).default("MX"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});
export type CatalogInput = z.infer<typeof catalogInput>;
export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  country: string;
  currency: string | null;
  logo: string | null;
  denominations: number[];
  minimum: number | null;
  maximum: number | null;
  instructions: string | null;
  global: boolean;
};

const positive = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
const amounts = (value: unknown): number[] => Array.isArray(value) ? value.map(positive).filter((x): x is number => x !== null) : [];
const text = (value: unknown) => typeof value === "string" ? value : "";
const currency = (value: unknown) => typeof value === "string" && /^[A-Z]{3}$/.test(value) ? value : null;
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

function logo(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  for (const candidate of value) {
    if (typeof candidate !== "string") continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" && !url.username && !url.password &&
        (url.hostname === "cdn.reloadly.com" || url.hostname === "s3.amazonaws.com" || url.hostname.endsWith(".amazonaws.com"))) return url.href;
    } catch { /* Ignore an invalid provider image. */ }
  }
  return null;
}

/** Public catalog only: supplier costs, discounts and commissions never leave this boundary. */
export function normalizeItem(raw: unknown, kind: CatalogInput["kind"]): CatalogItem | null {
  const item = record(raw);
  const id = kind === "topups" ? item.operatorId ?? item.id : item.productId;
  const name = text(kind === "topups" ? item.name : item.productName);
  if ((typeof id !== "number" && typeof id !== "string") || !name) return null;
  if (typeof item.status === "string" && item.status !== "ACTIVE") return null;
  const country = text(record(item.country).isoName);
  if (!/^[A-Z]{2}$/.test(country)) return null;
  const isGift = kind === "giftcards";
  return {
    id: String(id), name, country,
    category: isGift ? "Tarjeta de regalo" : item.data ? "Datos móviles" : item.bundle ? "Paquete móvil" : "Tiempo aire",
    currency: currency(isGift ? item.recipientCurrencyCode : item.destinationCurrencyCode),
    logo: logo(item.logoUrls),
    // Topup fixedAmounts/minAmount are in the supplier's currency. Never label them as local credit.
    denominations: amounts(isGift ? item.fixedRecipientDenominations : item.localFixedAmounts),
    minimum: positive(isGift ? item.minRecipientDenomination : item.localMinAmount),
    maximum: positive(isGift ? item.maxRecipientDenomination : item.localMaxAmount),
    instructions: isGift ? text(record(item.redeemInstruction).concise).slice(0,1200) || null : null,
    global: item.global === true,
  };
}

export function countryName(code: string) {
  try { return new Intl.DisplayNames(["es-MX"], { type: "region" }).of(code) ?? code; }
  catch { return code; }
}
