import { db, schema } from "@/db/client";

export type NotificationInput = {
  userId: string;
  type: (typeof schema.notificationTypeEnum.enumValues)[number];
  title: string;
  body?: string;
  deepLink?: string;
  data?: Record<string, unknown>;
};

export interface NotificationProvider {
  readonly name: string;
  send(input: NotificationInput): Promise<{ id: string }>;
}

/** In-app: tabla `notifications`. Push (VAPID) y correo (Resend) se suman en fases 6 y 8. */
class InAppNotificationProvider implements NotificationProvider {
  readonly name = "in_app";
  async send(input: NotificationInput) {
    const [row] = await db()
      .insert(schema.notifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        deepLink: input.deepLink ?? null,
        data: input.data ?? {},
      })
      .returning({ id: schema.notifications.id });
    return { id: row?.id ?? "" };
  }
}

export function notifier(): NotificationProvider {
  return new InAppNotificationProvider();
}
