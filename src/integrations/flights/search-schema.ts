import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Elige una fecha válida.");

export const flightSearchSchema = z.object({
  origin: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  destination: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  originType: z.enum(["airport", "city"]).default("city"),
  destinationType: z.enum(["airport", "city"]).default("city"),
  depart: date,
  returnDate: date.optional(),
  adults: z.number().int().min(1).max(9),
  cabin: z.enum(["economy", "premium_economy", "business", "first"]).default("economy"),
}).superRefine((input, ctx) => {
  if (input.origin === input.destination) ctx.addIssue({ code: "custom", path: ["destination"], message: "El origen y el destino deben ser distintos." });
  if (input.depart < new Date().toISOString().slice(0, 10)) ctx.addIssue({ code: "custom", path: ["depart"], message: "Elige una fecha de salida a partir de hoy." });
  if (input.returnDate && input.returnDate < input.depart) ctx.addIssue({ code: "custom", path: ["returnDate"], message: "El regreso debe ser el mismo día de la salida o después." });
});
export type FlightSearchInput = z.infer<typeof flightSearchSchema>;
