import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { Page, PageHeader } from "@/ui/page";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();
  const rows = await db().query.notifications.findMany({ where: eq(schema.notifications.userId, user.id), orderBy: desc(schema.notifications.createdAt), limit: 50 });
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <Page>
      <PageHeader eyebrow="Notificaciones" title="Lo que pasó" />
      {rows.length === 0 ? <EmptyState title="Nada nuevo por ahora." /> : (
        <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">
          {rows.map((n) => (
            <li key={n.id}>
              <Link href={n.deepLink ?? "#"} className="block px-4 py-3.5 hover:bg-surface-2">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={`text-[15px] ${n.readAt ? "" : "font-medium"}`}>{n.title}</p>
                  <time className="shrink-0 text-[12px] text-muted">{fmt.format(n.createdAt)}</time>
                </div>
                {n.body ? <p className="mt-0.5 text-sm text-text-2">{n.body}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
