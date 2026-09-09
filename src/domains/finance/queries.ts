import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "@/db/client";

export type MoneyStatus = "estimated" | "pending" | "confirmed" | "paid";

export async function incomeForOwner(userId: string) {
  return db().query.incomeEntries.findMany({ where: eq(schema.incomeEntries.ownerUserId, userId), orderBy: desc(schema.incomeEntries.periodStart) });
}

export async function expensesForOwner(userId: string) {
  return db().query.expenses.findMany({ where: eq(schema.expenses.ownerUserId, userId), orderBy: desc(schema.expenses.incurredOn) });
}

/** Totales por status. Nunca se suman estimados con realizados. */
export function totalsByStatus(rows: Array<{ amount: string; status: MoneyStatus }>) {
  const t: Record<MoneyStatus, number> = { estimated: 0, pending: 0, confirmed: 0, paid: 0 };
  for (const r of rows) t[r.status] += Number(r.amount);
  return t;
}

export async function statementFor(userId: string, period: string) {
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return null;
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const endDate = new Date(Date.UTC(y, m, 0));
  const end = endDate.toISOString().slice(0, 10);
  const [income, expenses] = await Promise.all([
    db().query.incomeEntries.findMany({ where: and(eq(schema.incomeEntries.ownerUserId, userId), gte(schema.incomeEntries.periodStart, start), lte(schema.incomeEntries.periodStart, end)) }),
    db().query.expenses.findMany({ where: and(eq(schema.expenses.ownerUserId, userId), gte(schema.expenses.incurredOn, start), lte(schema.expenses.incurredOn, end)) }),
  ]);
  return { start, end, income, expenses };
}
