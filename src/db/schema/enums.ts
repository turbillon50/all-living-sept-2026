import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "guest", "provider", "operator", "admin"]);
export const roleStatusEnum = pgEnum("role_status", ["active", "suspended"]);

export const propertyStatusEnum = pgEnum("property_status", ["active", "inactive"]);
export const mediaKindEnum = pgEnum("media_kind", ["photo", "floorplan", "video"]);

export const fractionStatusEnum = pgEnum("fraction_status", ["active", "inactive"]);
export const seasonEnum = pgEnum("season", ["alta", "puente", "baja"]);
export const weekStatusEnum = pgEnum("week_status", [
  "available",
  "reserved_owner",
  "guest_assigned",
  "released_for_rent",
  "listed",
  "booked",
  "occupied",
  "maintenance_block",
  "completed",
  "cancelled",
]);

export const stayStatusEnum = pgEnum("stay_status", ["upcoming", "in_progress", "completed", "cancelled"]);
export const stayGuestRoleEnum = pgEnum("stay_guest_role", ["host", "guest"]);
export const stayGuestStatusEnum = pgEnum("stay_guest_status", ["invited", "accepted", "declined", "removed"]);

export const providerKindEnum = pgEnum("provider_kind", ["person", "company"]);
export const providerStatusEnum = pgEnum("provider_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "suspended",
]);
export const serviceCategoryEnum = pgEnum("service_category", [
  "concierge",
  "transport",
  "yachts",
  "chefs",
  "housekeeping",
  "maintenance",
  "childcare",
  "wellness",
  "massage",
  "personal_trainer",
  "beach_clubs",
  "tours",
  "experiences",
  "golf",
  "car_rental",
  "grocery",
  "photography",
  "events",
  "security",
  "other",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "requested",
  "pending_provider",
  "confirmed",
  "payment_pending",
  "paid",
  "in_progress",
  "completed",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "succeeded", "failed", "refunded"]);
export const payoutStatusEnum = pgEnum("payout_status", ["scheduled", "paid", "failed"]);

export const inventoryStatusEnum = pgEnum("inventory_status", ["released", "listed", "booked", "withdrawn"]);
export const rentalBookingStatusEnum = pgEnum("rental_booking_status", [
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
]);

export const moneyStatusEnum = pgEnum("money_status", ["estimated", "pending", "confirmed", "paid"]);
export const incomeSourceEnum = pgEnum("income_source", ["rental", "service", "other"]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "stay",
  "booking",
  "service",
  "payment",
  "access",
  "provider",
  "maintenance",
  "message",
  "system",
]);

export const incidentPriorityEnum = pgEnum("incident_priority", ["low", "medium", "high", "urgent"]);
export const incidentStatusEnum = pgEnum("incident_status", ["open", "assigned", "in_progress", "resolved", "closed"]);

export const accessTokenKindEnum = pgEnum("access_token_kind", ["living_pass", "stay_access", "guest_invite"]);
export const documentVisibilityEnum = pgEnum("document_visibility", ["owner", "guest", "operator"]);
