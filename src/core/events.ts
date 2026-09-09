import { db, schema } from "@/db/client";

export type DomainEventName =
  | "fraction.created"
  | "fraction.sold"
  | "ownership.transferred"
  | "week.claimed"
  | "week.released"
  | "stay.created"
  | "stay.started"
  | "stay.completed"
  | "guest.invited"
  | "inventory.released"
  | "rental.booked"
  | "service.requested"
  | "service.confirmed"
  | "service.completed"
  | "payment.completed"
  | "provider.approved"
  | "incident.created"
  | "incident.resolved";

/** Escribe en el outbox. Un publicador (fase 7) lo entrega a Fraction Core, PMS y V&LIVING. */
export async function emit(
  name: DomainEventName,
  aggregate: string,
  aggregateId: string | null,
  payload: Record<string, unknown> = {},
) {
  await db().insert(schema.domainEvents).values({ name, aggregate, aggregateId, payload });
}

export async function audit(input: {
  actorUserId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}) {
  await db().insert(schema.auditLogs).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
  });
}
