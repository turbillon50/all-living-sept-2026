type Tone = "neutral" | "accent" | "success" | "warning" | "danger";
const STATUS: Record<string, { label: string; tone: Tone }> = {
  requested: { label: "Solicitado", tone: "neutral" },
  pending_provider: { label: "Pendiente", tone: "warning" },
  confirmed: { label: "Confirmado", tone: "success" },
  payment_pending: { label: "Pago pendiente", tone: "warning" },
  paid: { label: "Pagado", tone: "success" },
  in_progress: { label: "En curso", tone: "accent" },
  completed: { label: "Completado", tone: "neutral" },
  cancelled: { label: "Cancelado", tone: "danger" },
  refunded: { label: "Reembolsado", tone: "neutral" },
};

export const BOOKING_STATUS = new Proxy(STATUS, { get: (t, k: string) => t[k] ?? { label: String(k), tone: "neutral" as Tone } }) as Record<string, { label: string; tone: Tone }>;
