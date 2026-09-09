const MX_DATE = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });
const MX_DATE_LONG = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" });

export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12));
}

/** "20–27 dic" a partir de dos fechas ISO (YYYY-MM-DD). */
export function formatRange(start: string, end: string): string {
  const a = parseDateOnly(start);
  const b = parseDateOnly(end);
  const sameMonth = a.getUTCMonth() === b.getUTCMonth();
  const da = a.getUTCDate();
  const fb = MX_DATE.format(b).replace(".", "");
  return sameMonth ? `${da}–${fb}` : `${MX_DATE.format(a).replace(".", "")} – ${fb}`;
}

export function formatLongDate(value: string): string {
  return MX_DATE_LONG.format(parseDateOnly(value));
}

export function daysUntil(value: string, from = new Date()): number {
  const target = parseDateOnly(value).getTime();
  const today = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 12);
  return Math.round((target - today) / 86_400_000);
}

export function money(amount: number | string, currency = "MXN"): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("es-MX", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
