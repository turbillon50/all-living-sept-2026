export const INCIDENT_STATUS: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger" }> = {
  open: { label: "Abierta", tone: "warning" },
  assigned: { label: "Asignada", tone: "accent" },
  in_progress: { label: "En atención", tone: "accent" },
  resolved: { label: "Resuelta", tone: "success" },
  closed: { label: "Cerrada", tone: "neutral" },
};
export const PRIORITY: Record<string, { label: string; tone: "neutral" | "warning" | "danger" }> = {
  low: { label: "Baja", tone: "neutral" }, medium: { label: "Media", tone: "neutral" }, high: { label: "Alta", tone: "warning" }, urgent: { label: "Urgente", tone: "danger" },
};
