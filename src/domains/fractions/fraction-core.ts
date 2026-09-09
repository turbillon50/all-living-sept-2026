/**
 * FRACTION CORE — contrato.
 * El resto de ALL LIVING no toca las tablas fractional directamente: pasa por aquí.
 * MVP: implementación local sobre Neon (local-fraction-core.ts). Después puede ser servicio aparte.
 */
import type { Role } from "@/core/roles";

export type Season = "alta" | "puente" | "baja";
export type WeekStatus =
  | "available"
  | "reserved_owner"
  | "guest_assigned"
  | "released_for_rent"
  | "listed"
  | "booked"
  | "occupied"
  | "maintenance_block"
  | "completed"
  | "cancelled";

export type Ownership = {
  id: string;
  fractionId: string;
  fractionCode: string;
  propertyId: string;
  propertyName: string;
  destination: string;
  share: number;
  acquiredAt: Date;
  active: boolean;
};

export type Fraction = {
  id: string;
  code: string;
  propertyId: string;
  propertyName: string;
  destination: string;
  totalWeeks: number;
  status: "active" | "inactive";
};

export type FractionWeek = {
  id: string;
  fractionId: string;
  year: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  season: Season;
  status: WeekStatus;
  statusReason: string | null;
};

export type ClaimWeekInput = {
  weekId: string;
  ownerUserId: string;
  guestsCount: number;
  arrivalTime?: string | null;
  arrivalMode?: string | null;
  notes?: string | null;
};

export type ReleaseWeekInput = {
  weekId: string;
  ownerUserId: string;
  nightlyRateEstimate?: number | null;
  currency?: string;
  commissionPct?: number;
  minNights?: number;
  cancellationPolicy?: string | null;
};

export type AssignGuestInput = {
  stayId: string;
  invitedBy: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  permissions?: Record<string, boolean>;
};

export type TransferOwnershipInput = {
  fractionId: string;
  fromUserId: string;
  toUserId: string;
  actorUserId: string;
  actorRole: Role;
  source?: string;
};

export interface FractionCoreClient {
  getUserOwnerships(userId: string): Promise<Ownership[]>;
  getFraction(fractionId: string): Promise<Fraction | null>;
  getFractionWeeks(fractionId: string): Promise<FractionWeek[]>;
  getWeek(weekId: string): Promise<FractionWeek | null>;
  getWeekAvailability(weekId: string): Promise<{ available: boolean; status: WeekStatus; reason?: string }>;
  /** Reserva la semana para uso del titular y crea la estancia. Atómico: nunca dos estancias por semana. */
  claimWeek(input: ClaimWeekInput): Promise<{ stayId: string; weekId: string }>;
  /** Libera la semana para renta y crea inventario. No publica en canales. */
  releaseWeekForRental(input: ReleaseWeekInput): Promise<{ inventoryId: string; weekId: string }>;
  assignGuest(input: AssignGuestInput): Promise<{ guestId: string; inviteToken: string }>;
  /** Reservado a sistemas autorizados (admin / Fraction Core). Histórico, nunca destructivo. */
  transferOwnership(input: TransferOwnershipInput): Promise<{ closedOwnershipId: string; newOwnershipId: string }>;
  /** Sincroniza titularidades desde la fuente externa (V&LIVING) cuando exista adaptador. */
  syncOwnerships(userId: string): Promise<{ synced: number }>;
}
