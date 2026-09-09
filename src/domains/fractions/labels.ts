import type { Season, WeekStatus } from "./fraction-core";

export const SEASON_LABEL: Record<Season, string> = { alta: "alta", puente: "puente", baja: "baja" };

export const WEEK_STATUS: Record<WeekStatus, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger" }> = {
  available: { label: "Disponible", tone: "success" },
  reserved_owner: { label: "Reservada para ti", tone: "accent" },
  guest_assigned: { label: "Con invitados", tone: "accent" },
  released_for_rent: { label: "Liberada para renta", tone: "warning" },
  listed: { label: "Publicada", tone: "warning" },
  booked: { label: "Rentada", tone: "warning" },
  occupied: { label: "Ocupada", tone: "accent" },
  maintenance_block: { label: "Mantenimiento", tone: "neutral" },
  completed: { label: "Completada", tone: "neutral" },
  cancelled: { label: "Cancelada", tone: "danger" },
};
